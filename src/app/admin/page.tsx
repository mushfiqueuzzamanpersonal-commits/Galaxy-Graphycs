'use client';

import { useState, useEffect } from 'react';
import { Package, Search, ChevronDown, ChevronRight, X, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [viewDescription, setViewDescription] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (e) {
      console.error("Failed to update status");
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading orders...</div>;
  }

  // Group orders by customer
  const groupedOrders = orders.reduce((acc, order) => {
    const name = order.customerName || 'Unknown Customer';
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(order);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleCustomer = (customerName: string) => {
    if (expandedCustomer === customerName) {
      setExpandedCustomer(null);
    } else {
      setExpandedCustomer(customerName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Order Management</h2>
          <p className="text-gray-400">View and process customer orders.</p>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search Customer..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 bg-gray-900/50 border-b border-gray-700 font-semibold text-gray-300">
          Customers List
        </div>
        <div className="divide-y divide-gray-700/50">
          {Object.keys(groupedOrders).length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-3 opacity-50" />
              No orders found.
            </div>
          )}
          {Object.entries(groupedOrders).map(([customerName, customerOrders]: [string, any[]]) => (
            <div key={customerName} className="flex flex-col">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                onClick={() => toggleCustomer(customerName)}
              >
                <div className="flex items-center space-x-3">
                  {expandedCustomer === customerName ? (
                    <ChevronDown className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{customerName}</h3>
                    <p className="text-xs text-gray-400">{customerOrders.length} order(s)</p>
                  </div>
                </div>
              </div>

              {/* Nested Orders List */}
              {expandedCustomer === customerName && (
                <div className="bg-gray-900/30 p-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customerOrders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-xs text-indigo-400">{order.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                            order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' : 
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <h4 className="text-white font-bold truncate mb-1">{order.printTitle}</h4>
                        <div className="text-xs text-gray-400 mb-2">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">₹{order.totalAmount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500 uppercase">{order.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Order Details</h3>
                <p className="text-sm font-mono text-indigo-400">{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status & Payment */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900/50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-xl font-black text-green-400">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                  <p className="text-sm font-medium text-white uppercase">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Customer & Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2 mb-3">Customer Info</h4>
                  <p className="text-white font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-400 mt-1">Contact: <span className="text-white">{selectedOrder.contactNo || 'N/A'}</span></p>
                  <p className="text-sm text-gray-400 mt-1">WhatsApp: <span className="text-white">{selectedOrder.whatsappNo || 'N/A'}</span></p>
                  <p className="text-sm text-gray-400 mt-1">Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2 mb-3">Item Specifications</h4>
                  <p className="text-white font-medium">{selectedOrder.categoryName === 'Others' ? selectedOrder.customCategory : selectedOrder.categoryName}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.materialName}</p>
                  <p className="text-sm text-gray-400">{selectedOrder.width} x {selectedOrder.height} {selectedOrder.unit}</p>
                  <p className="text-sm text-gray-400">Quantity: {selectedOrder.quantity}</p>
                  <p className="text-sm text-gray-400">Area: {(selectedOrder.squareFeet || selectedOrder.squareMeters || 0).toFixed(4)} sqft</p>
                </div>
              </div>

              {/* Print Content Details */}
              <div>
                <h4 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2 mb-3">Print Details</h4>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Print Title</p>
                    <p className="text-lg font-bold text-white">{selectedOrder.printTitle}</p>
                  </div>
                  
                  {selectedOrder.printDescription && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                      <div className="bg-gray-800 p-3 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-300 line-clamp-3 mb-2">{selectedOrder.printDescription}</p>
                        {selectedOrder.printDescription.length > 100 && (
                          <button 
                            onClick={() => setViewDescription(selectedOrder.printDescription)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Read More
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedOrder.sampleFileName && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Attached File</p>
                      <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm text-gray-300">{selectedOrder.sampleFileName}</span>
                        </div>
                        {selectedOrder.fileUrl && (
                          <a 
                            href={selectedOrder.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-md font-bold transition-colors shadow-lg"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Dialog */}
      {viewDescription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
              <h3 className="text-lg font-bold text-white">Full Description</h3>
              <button 
                onClick={() => setViewDescription(null)}
                className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto overflow-x-hidden">
              <p className="text-sm text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                {viewDescription}
              </p>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end shrink-0">
              <button 
                onClick={() => setViewDescription(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
