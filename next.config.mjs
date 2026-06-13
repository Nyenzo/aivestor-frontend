/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const aiUrl = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:5001';
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

        // Ensure WebSocket allows secure and insecure
        const wsUrl = socketUrl.replace(/^http/, 'ws');
        const connectSources = Array.from(new Set([
            "'self'",
            'ws:',
            'wss:',
            apiUrl,
            aiUrl,
            socketUrl,
            wsUrl,
            'http://localhost:5000',
            'http://localhost:5005',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:5005',
            'ws://localhost:5000',
            'ws://localhost:5005',
            'ws://127.0.0.1:5000',
            'ws://127.0.0.1:5005',
            'https://identitytoolkit.googleapis.com',
            'https://securetoken.googleapis.com',
            'https://api.deepseek.com',
            'https://firestore.googleapis.com',
            'https://*.firebaseio.com',
        ])).join(' ');

        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src ${connectSources}; frame-src 'self' https://*.firebaseapp.com https://aivestor-fd289.firebaseapp.com`
                    }
                ]
            },
            {
                source: '/stitch/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=300, stale-while-revalidate=86400'
                    }
                ]
            },
            {
                source: '/:path*\\.(png|jpg|jpeg|webp|svg|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            }
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
};
export default nextConfig;
