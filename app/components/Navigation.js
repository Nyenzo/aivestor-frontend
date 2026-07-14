'use client';

// Aivestor navigation sidebar for authenticated users

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { showSuccess } from '../lib/toast';
import Logo from './Logo';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard'
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: 'pie_chart'
  },
  {
    label: 'AI Chat',
    href: '/chat',
    icon: 'chat'
  },
  {
    label: 'Exchange',
    href: '/brokerage',
    icon: 'swap_horiz'
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'settings'
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Hide sidebar on non-authenticated pages
  const noNavPages = ['/login', '/register', '/forgot-password', '/onboarding', '/', '/analytics', '/settings'];
  const hideSidebar = noNavPages.includes(pathname);

  useEffect(() => {
    // Fetch user session data
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

  if (hideSidebar) {
    return null;
  }

  return (
    <>

      <button
        aria-label="Toggle mobile menu"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          flex-shrink-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          flex flex-col flex-nowrap z-40 transition-transform duration-300
          fixed top-[30px] left-0 h-[calc(100vh-30px)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="flex flex-col gap-8 p-6">

          <div className="flex items-center gap-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12 ring-2 ring-primary/30 flex items-center justify-center bg-slate-100 dark:bg-slate-800"
              title={user?.email || 'User'}
            >

              <Logo className="w-8 h-8" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-slate-900 dark:text-white font-display text-lg font-bold tracking-wide truncate">Aivestor</h1>
              <span className="text-primary text-[10px] font-mono uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20 w-fit truncate max-w-full">
                {user ? (user.displayName || user.name || user.email?.split('@')[0] || 'Pro') : 'Pro'}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              if (isActive) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current="page"
                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-bold transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="material-symbols-outlined text-primary fill-1">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group text-sm font-medium"
          >
            <span className="material-symbols-outlined text-red-500/70 group-hover:text-red-400 transition-colors">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
