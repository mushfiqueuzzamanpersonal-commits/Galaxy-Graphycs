'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Layers } from 'lucide-react';

export default function MaterialsManagementPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newMaterial, setNewMaterial] = useState({ categoryId: '', name: '', pricePerSqFt: '' });
  
  // Edit State
  const [editingMaterial, setEditingMaterial] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [catRes, matRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/materials')
      ]);
      const cats = await catRes.json();
      const mats = await matRes.json();
      setCategories(cats);
      setMaterials(mats);
      if (!newMaterial.categoryId && cats.length > 0) {
        setNewMaterial(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });
      setNewCategoryName('');
      fetchData();
    } catch (e) {
      alert('Failed to add category');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.categoryId || !newMaterial.name || !newMaterial.pricePerSqFt) return;
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });
      setNewMaterial({ categoryId: newMaterial.categoryId, name: '', pricePerSqFt: '' });
      fetchData();
    } catch (e) {
      alert('Failed to add material');
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    try {
      await fetch('/api/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMaterial)
      });
      setEditingMaterial(null);
      fetchData();
    } catch (e) {
      alert('Failed to update material');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      alert('Failed to delete material');
    }
  };

  if (isLoading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pricing & Materials Management</h2>
        <p className="text-gray-400">Add, edit, or remove printing materials and adjust their rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forms Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          {/* Add Category Form */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Add Category</h3>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Mug Printing"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                Add Category
              </button>
            </form>
          </div>

          {/* Add Material Form */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Add Material</h3>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Category</label>
                <select 
                  value={newMaterial.categoryId}
                  onChange={(e) => setNewMaterial({ ...newMaterial, categoryId: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Material Name</label>
                <input 
                  type="text" 
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="e.g. 300gsm Glossy"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price per Sq. Ft. (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={newMaterial.pricePerSqFt}
                  onChange={(e) => setNewMaterial({ ...newMaterial, pricePerSqFt: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm transition-colors flex justify-center items-center">
                <Plus className="w-4 h-4 mr-2" /> Add Material
              </button>
            </form>
          </div>
        </div>

        {/* Data View */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => {
            const catMaterials = materials.filter(m => m.categoryId === category.id);
            return (
              <div key={category.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="bg-gray-900/80 px-6 py-4 border-b border-gray-700">
                  <h4 className="text-lg font-bold text-indigo-300">{category.name}</h4>
                </div>
                
                {catMaterials.length > 0 ? (
                  <div className="divide-y divide-gray-700/50">
                    {catMaterials.map((material) => (
                      <div key={material.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors">
                        {editingMaterial?.id === material.id ? (
                          <form onSubmit={handleUpdateMaterial} className="flex-1 flex items-center space-x-4">
                            <input 
                              type="text" 
                              value={editingMaterial.name}
                              onChange={(e) => setEditingMaterial({...editingMaterial, name: e.target.value})}
                              className="bg-gray-900 border border-gray-600 rounded text-sm px-2 py-1 text-white flex-1"
                              required
                            />
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400">₹</span>
                              <input 
                                type="number" 
                                min="0" step="0.01"
                                value={editingMaterial.pricePerSqFt}
                                onChange={(e) => setEditingMaterial({...editingMaterial, pricePerSqFt: e.target.value})}
                                className="bg-gray-900 border border-gray-600 rounded text-sm px-2 py-1 text-white w-24"
                                required
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button type="submit" className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-500 font-medium">Save</button>
                              <button type="button" onClick={() => setEditingMaterial(null)} className="text-xs bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-500 font-medium">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="font-medium text-white">{material.name}</p>
                            </div>
                            <div className="w-32 text-right">
                              <span className="font-mono text-green-400 font-bold">₹{material.pricePerSqFt.toFixed(2)} / sqft</span>
                            </div>
                            <div className="w-24 flex justify-end space-x-2">
                              <button onClick={() => setEditingMaterial(material)} className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-700 rounded transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMaterial(material.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-6 text-center text-sm text-gray-500">
                    No materials added to this category yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
