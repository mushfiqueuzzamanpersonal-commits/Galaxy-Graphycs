'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Package, Calendar, FileText, X } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDescription, setViewDescription] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/orders?customerId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [user]);

  if (isLoading) {
    return <div className="text-gray-400">Loading orders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">My Orders</h2>
          <p className="text-gray-400">View and track your printing requests.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-gray-400">You haven't placed any orders with us.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                    order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 break-all line-clamp-2">
                    {order.printTitle}
                  </h4>
                  <p className="text-sm text-gray-300 font-medium mb-1">
                    {order.categoryName === 'Others' ? order.customCategory : order.categoryName} - {order.materialName} (Qty: {order.quantity || 1})
                  </p>
                  <p className="text-sm text-gray-400 font-mono text-xs mb-2 break-all">Order ID: {order.id}</p>
                  {order.printDescription && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-400 italic line-clamp-2 break-all">"{order.printDescription}"</p>
                      {order.printDescription.length > 60 && (
                        <button 
                          onClick={() => setViewDescription(order.printDescription)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-1"
                        >
                          Read More
                        </button>
                      )}
                    </div>
                  )}
                  {order.sampleFileName && (
                    <div className="mt-2 flex items-center justify-between bg-gray-800/50 p-2 rounded border border-gray-700 min-w-0">
                      <p className="text-xs text-indigo-400 flex items-center gap-1 min-w-0 truncate pr-2">
                        <FileText className="w-3 h-3 shrink-0" /> 
                        <span className="truncate">{order.sampleFileName}</span>
                      </p>
                      {order.fileUrl && (
                        <a 
                          href={order.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-900/50 p-4 rounded-lg">
                  <div>
                    <span className="text-gray-500 block mb-1">Dimensions</span>
                    <span className="text-gray-300 font-medium">{order.width} x {order.height} {order.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Total Area (per item)</span>
                    <span className="text-gray-300 font-medium">{(order.squareFeet || order.squareMeters || 0).toFixed(4)} sqft</span>
                  </div>
                </div>
              </div>

              <div className="md:w-48 bg-gray-900 rounded-lg p-4 flex flex-col justify-center border border-gray-700">
                <span className="text-gray-500 text-sm mb-1 text-center">Total Amount</span>
                <span className="text-2xl font-black text-indigo-400 text-center">₹{order.totalAmount.toFixed(2)}</span>
                <span className="text-gray-600 text-xs mt-2 text-center uppercase tracking-wide">
                  Via {order.paymentMethod === 'shop' ? 'Shop' : order.paymentMethod === 'upi' ? 'UPI' : 'QR'}
                </span>
              </div>
            </div>
          ))}
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
