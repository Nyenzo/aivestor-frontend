'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({ user, onLogout }) {
    const adminName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Investor';
    const role = user?.role || 'Investor';
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { href: '/portfolio', icon: 'analytics', label: 'Portfolios' },
        { href: '/market', icon: 'monitoring', label: 'Algo Health' },
        { href: '/analytics', icon: 'receipt_long', label: 'Activity Logs' },
        { href: '/settings', icon: 'settings', label: 'System Config' },
    ];

    return (
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col hidden lg:flex">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary p-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
                </div>
                <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Aivestor <span className="text-primary">Sys</span></h1>
            </div>
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                            pathname === item.href
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span> {item.label}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{adminName}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">{role}</p>
                    </div>
                </div>
                {onLogout && (
                    <button onClick={onLogout} className="mt-4 w-full text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 flex items-center gap-2 justify-center">
                        <span className="material-symbols-outlined text-[14px]">logout</span> Sign Out
                    </button>
                )}
            </div>
        </aside>
    );
}
