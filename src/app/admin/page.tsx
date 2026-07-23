'use client';

import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-gray-400 p-8 text-center flex justify-center items-center h-full">Loading dashboard data...</div>;
  }

  // Calculate Metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    return order.status !== 'Cancelled' ? sum + (order.totalAmount || 0) : sum;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const processingOrders = orders.filter(o => o.status === 'Processing').length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  
  // Recent orders
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: Package,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Processing Orders',
      value: processingOrders,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Completed Orders',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-400">Analytics and recent activity for your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Orders Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="p-4 bg-gray-900/50 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-300">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              View All Orders
            </Link>
          </div>
          <div className="divide-y divide-gray-700/50">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent orders found.</div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="p-4 hover:bg-gray-700/30 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{order.customerName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">₹{order.totalAmount.toFixed(2)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded inline-block ${
                      order.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                      order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' : 
                      order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg p-6">
          <h3 className="font-semibold text-gray-300 mb-6 border-b border-gray-700 pb-4">Order Status Breakdown</h3>
          <div className="space-y-5">
            {/* Pending Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Pending</span>
                <span className="text-white font-medium">{pendingOrders}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: totalOrders > 0 ? `${(pendingOrders / totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
            
            {/* Processing Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Processing</span>
                <span className="text-white font-medium">{processingOrders}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: totalOrders > 0 ? `${(processingOrders / totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>

            {/* Completed Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Completed</span>
                <span className="text-white font-medium">{completedOrders}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: totalOrders > 0 ? `${(completedOrders / totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
            
            {/* Cancelled Bar */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Cancelled</span>
                <span className="text-white font-medium">{cancelledOrders}</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                <div className="bg-red-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: totalOrders > 0 ? `${(cancelledOrders / totalOrders) * 100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
