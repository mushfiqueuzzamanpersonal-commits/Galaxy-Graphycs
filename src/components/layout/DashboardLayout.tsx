'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, LayoutDashboard, Settings, ShoppingCart, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = user.role === 'admin' 
    ? [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { label: 'Materials', href: '/admin/materials', icon: Settings },
      ]
    : [
        { label: 'New Order', href: '/customer', icon: ShoppingCart },
        { label: 'My Orders', href: '/customer/orders', icon: UserIcon },
      ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div className="p-6 flex flex-col items-center">
          <div className="w-40 h-auto mb-2 relative flex items-center justify-center bg-white rounded p-2">
            <Image src="/logo.jpg" alt="Galaxy Graphics" width={150} height={150} className="object-contain" />
          </div>
          <p className="text-xs text-gray-400 mt-1 capitalize font-medium">{user.role} Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="w-24 h-auto relative flex items-center justify-center bg-white rounded p-1">
            <Image src="/logo.jpg" alt="Galaxy Graphics" width={80} height={80} className="object-contain" />
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
        {/* Mobile Nav */}
        <nav className="md:hidden flex overflow-x-auto bg-gray-800 border-b border-gray-700">
           {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
