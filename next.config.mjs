import process from 'node:process';

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        const raw = (process.env.API_INTERNAL_URL || 'http://localhost:3001').replace(/\/$/, '');
        const apiOrigin = raw.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3001';

        return [
            {
                source: '/api/v1/:path*',
                destination: `${apiOrigin}/api/v1/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    output: 'standalone',
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
};

export default nextConfig;
