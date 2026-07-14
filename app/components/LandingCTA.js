'use client';

import { useRouter } from 'next/navigation';

export default function LandingCTA({ variant = 'primary', href, children, className = '' }) {
    const router = useRouter();
    return (
        <button onClick={() => router.push(href)} className={className} type="button">
            {children}
        </button>
    );
}
