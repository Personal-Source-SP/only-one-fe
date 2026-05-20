import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/antd/dist/antd.min.js',
    ],
    theme: {
        extend: {
            colors: {
                hub: {
                    primary: 'var(--hub-primary)',
                    cta: 'var(--hub-cta)',
                    bg: 'var(--hub-bg)',
                    surface: 'var(--hub-surface)',
                    border: 'var(--hub-border)',
                    'border-card': 'var(--hub-border-card)',
                    text: 'var(--hub-text)',
                    title: 'var(--hub-title)',
                    muted: 'var(--hub-muted)',
                    success: 'var(--hub-success)',
                },
                background: 'var(--hub-bg)',
            },
            borderRadius: {
                hub: '8px',
                'hub-card': '12px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    darkMode: 'class',
    plugins: [],
};
export default config;
