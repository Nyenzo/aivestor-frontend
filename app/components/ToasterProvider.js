"use client";

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#111813',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                },
                success: {
                    iconTheme: {
                        primary: '#0df259',
                        secondary: '#000',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}
