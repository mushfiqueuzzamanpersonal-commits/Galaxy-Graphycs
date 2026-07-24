'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Calculator, CheckCircle2, ChevronRight, Wallet, Upload, Package } from 'lucide-react';
import Image from 'next/image';

export default function CustomerOrderPage() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState<'cm' | 'in'>('in');
  const [printTitle, setPrintTitle] = useState('');
  const [printDescription, setPrintDescription] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI State
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: Landing, 1: Form, 2: Checkout, 3: Success
  const [paymentMethod, setPaymentMethod] = useState<'shop'>('shop');
  const [orderResult, setOrderResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/materials?categoryId=${selectedCategory}`)
        .then(res => res.json())
        .then(setMaterials);
      setSelectedMaterial('');
    } else {
      setMaterials([]);
    }
  }, [selectedCategory]);

  const activeMaterial = materials.find(m => m.id === selectedMaterial);
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  
  let squareFeet = 0;
  if (w > 0 && h > 0) {
    if (unit === 'cm') {
      squareFeet = (w * h) / 929.0304;
    } else {
      squareFeet = (w * h) / 144;
    }
  }

  const finalPrice = activeMaterial ? squareFeet * activeMaterial.pricePerSqFt * quantity : 0;

  const handleCheckout = () => {
    if (!selectedCategory || !selectedMaterial || w <= 0 || h <= 0 || !printTitle) return;
    setStep(2);
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    try {
      let fileBase64 = null;
      if (sampleFile) {
        fileBase64 = await fileToBase64(sampleFile);
      }

      const activeCat = categories.find(c => c.id === selectedCategory);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user?.id,
          customerName: user?.name,
          contactNo,
          whatsappNo,
          printTitle,
          printDescription,
          quantity,
          sampleFileName: sampleFile ? sampleFile.name : null,
          fileBase64,
          categoryId: selectedCategory,
          categoryName: activeCat?.name,
          customCategory: activeCat?.name === 'Others' ? customCategory : '',
          materialId: selectedMaterial,
          materialName: activeMaterial?.name,
          width: w,
          height: h,
          unit,
          squareFeet,
          totalAmount: finalPrice,
          paymentMethod
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderResult(data);
        setStep(3);
      } else {
        alert('Failed to place order');
      }
    } catch (e) {
      alert('Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setCustomCategory('');
    setSelectedMaterial('');
    setWidth('');
    setHeight('');
    setPrintTitle('');
    setPrintDescription('');
    setContactNo('');
    setWhatsappNo('');
    setQuantity(1);
    setSampleFile(null);
    setStep(0);
    setOrderResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {step === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 md:space-y-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-2 md:mb-4">
            <Package className="w-10 h-10 md:w-12 md:h-12 text-indigo-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready for a New Print?</h2>
          <p className="text-base md:text-lg text-gray-400 max-w-lg px-4">
            Create high-quality banners, posters, visiting cards, and more with Galaxy Graphics.
          </p>
          <button
            onClick={() => setStep(1)}
            className="mt-6 md:mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 md:py-4 md:px-10 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-105"
          >
            Start New Order
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Place New Order</h2>
              <p className="text-sm md:text-base text-gray-400">Fill in the details for your printing requirement.</p>
            </div>
            <div className="flex items-center flex-wrap gap-2 md:gap-0 md:space-x-2 text-xs md:text-sm">
              <span className={`px-2 md:px-3 py-1 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>1. Details</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
              <span className={`px-2 md:px-3 py-1 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500'}`}>2. Payment</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
              <span className={`px-2 md:px-3 py-1 rounded-full ${step === 3 ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}>3. Done</span>
            </div>
          </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6 bg-gray-800 border border-gray-700 p-4 md:p-6 rounded-xl">
            {/* Print Details */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
              <h3 className="text-lg font-bold text-white">Print Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Print Title</label>
                <input
                  type="text"
                  required
                  value={printTitle}
                  onChange={(e) => setPrintTitle(e.target.value)}
                  placeholder="e.g. Shop Banner 2026"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={printDescription}
                  onChange={(e) => setPrintDescription(e.target.value)}
                  placeholder="Any specific instructions or details about what needs to be written/printed..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload Sample Design (Optional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700/30 hover:border-indigo-500 transition-colors"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSampleFile(e.target.files[0]);
                      }
                    }} 
                  />
                  <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-sm text-gray-300">
                    {sampleFile ? sampleFile.name : 'Click to browse files'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={whatsappNo}
                    onChange={(e) => setWhatsappNo(e.target.value)}
                    placeholder="Optional if same"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {categories.find(c => c.id === selectedCategory)?.name === 'Others' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Specify Category</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Custom Flag"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Material</label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                disabled={!selectedCategory || materials.length === 0}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">{materials.length === 0 ? (selectedCategory ? 'No materials available' : 'Select category first') : 'Select a material'}</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} - ₹{m.pricePerSqFt}/sqft</option>
                ))}
              </select>
            </div>

            {/* Dimensions and Quantity */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Width"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 md:px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 md:px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Quantity"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Units */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
              <div className="flex bg-gray-900 p-1 rounded-lg w-full max-w-[200px] border border-gray-600">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${unit === 'in' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setUnit('in')}
                >
                  Inches
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${unit === 'cm' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setUnit('cm')}
                >
                  Centimeters
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="space-y-6 mt-6 md:mt-0">
            <div className="bg-gradient-to-b from-indigo-900 to-gray-800 border border-indigo-500/30 p-5 md:p-6 rounded-xl shadow-xl sticky top-8">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <Calculator className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold">Calculation</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Dimensions:</span>
                  <span className="font-medium text-white">{w || 0} x {h || 0} {unit}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Area (per item):</span>
                  <span className="font-medium text-white">{squareFeet.toFixed(4)} sqft</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Quantity:</span>
                  <span className="font-medium text-white">{quantity}</span>
                </div>
                {activeMaterial && (
                  <div className="flex justify-between text-gray-300">
                    <span>Rate:</span>
                    <span className="font-medium text-white">₹{activeMaterial.pricePerSqFt} / sqft</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-700/50 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 uppercase tracking-wider text-xs font-bold">Total Price</span>
                    <span className="text-3xl font-black text-indigo-400">₹{finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={!selectedCategory || !selectedMaterial || w <= 0 || h <= 0 || !printTitle || !contactNo}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Proceed to Checkout
              </button>
              {(!printTitle || !contactNo) && <p className="text-xs text-red-400 mt-2 text-center">Please enter Title and Contact Number</p>}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-gray-800 border border-gray-700 p-4 md:p-8 rounded-xl">
          <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Select Payment Method</h3>
          
          <div className="space-y-4 mb-8">
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'shop' ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600 hover:border-gray-500 bg-gray-900'}`}>
              <input type="radio" name="payment" value="shop" checked={paymentMethod === 'shop'} onChange={() => setPaymentMethod('shop')} className="hidden" />
              <Wallet className={`w-6 h-6 mr-4 ${paymentMethod === 'shop' ? 'text-indigo-400' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className="font-bold text-white">Pay in Shop</p>
                <p className="text-sm text-gray-400">Cash or Card on pickup</p>
              </div>
              {paymentMethod === 'shop' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
            </label>
          </div>


          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="flex-[2] py-3 px-4 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex justify-center items-center"
            >
              {isSubmitting ? 'Processing...' : `Confirm & Pay ₹${finalPrice.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      {step === 3 && orderResult && (
        <div className="max-w-2xl mx-auto bg-gray-800 border border-green-500/30 p-4 md:p-8 rounded-xl text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
          <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-8">Your order has been successfully placed.</p>
          
          <div className="bg-gray-900 p-4 md:p-6 rounded-lg border border-gray-700 text-left mb-6 md:mb-8 space-y-3 md:space-y-4 text-sm md:text-base overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-800 pb-3 md:pb-4 gap-1 sm:gap-0">
              <span className="text-gray-400">Order ID</span>
              <span className="font-mono font-bold text-indigo-400 break-all">{orderResult.id}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-800 pb-3 md:pb-4 gap-1 sm:gap-0">
              <span className="text-gray-400">Title</span>
              <span className="font-medium text-white break-words">{orderResult.printTitle}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-800 pb-3 md:pb-4 gap-1 sm:gap-0">
              <span className="text-gray-400">Item</span>
              <span className="font-medium text-white break-words">{orderResult.categoryName === 'Others' ? orderResult.customCategory : orderResult.categoryName} - {orderResult.materialName}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-800 pb-3 md:pb-4 gap-1 sm:gap-0">
              <span className="text-gray-400">Dimensions</span>
              <span className="font-medium text-white break-words">{orderResult.width} x {orderResult.height} {orderResult.unit} ({orderResult.squareFeet.toFixed(4)} sqft) x {orderResult.quantity}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-white">Total Amount</span>
              <span className="font-black text-xl text-green-400">₹{orderResult.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Place Another Order
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
