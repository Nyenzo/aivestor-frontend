'use client';

import { usePathname } from 'next/navigation';

// Pages that don't use the shared sidebar nav
const NO_NAV_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/onboarding', '/', '/settings'];

export default function ClientLayout({ children }) {
    const pathname = usePathname();
    const hasNav = !NO_NAV_PAGES.includes(pathname);

    return (
        <div className={`flex-1 flex flex-col w-full min-w-0 ${hasNav ? 'md:pl-64' : ''}`}>
            {children}
        </div>
    );
}
