import process from 'node:process';

const isTurbopack = Boolean(process.env.TURBOPACK);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    experimental: {
        ...(isTurbopack ? { turbopackRustReactCompiler: true } : {}),
        optimizePackageImports: [
            'antd',
            '@ant-design/icons',
            '@refinedev/antd',
            '@refinedev/core',
            '@iconify/react',
            'lodash',
            'recharts',
            'dayjs',
            'zustand',
            '@monaco-editor/react',
            'socket.io-client',
        ],
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return [];

        const apiOrigin = apiUrl.replace(/\/$/, '').replace(/\/api\/v1\/?$/, '');
        if (!apiOrigin) return [];

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
