'use client';

/**
 * Navigation Sidebar Component
 * 
 * Provides persistent navigation for authenticated users.
 * Includes user profile, main menu items, and logout functionality.
 */

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  User,
  Link2
} from 'lucide-react';
import { showSuccess } from '../lib/toast';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: Briefcase
  },
  {
    label: 'AI Chat',
    href: '/chat',
    icon: MessageSquare
  },
  {
    label: 'Brokerage',
    href: '/brokerage',
    icon: Link2
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show nav on auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/onboarding'];
  const isAuthPage = authPages.includes(pathname) || pathname === '/';

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showSuccess('Logged out successfully');
    router.push('/login');
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 
          flex flex-col z-40 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <span className="text-xl font-bold">Aivestor</span>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition
                      ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-gray-800 transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
}
