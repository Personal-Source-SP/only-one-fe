import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/constants/**/*.{js,ts,tsx}',
        './src/contexts/**/*.{js,ts,jsx,tsx}',
        './src/libs/**/*.{js,ts,tsx}',
        './node_modules/antd/dist/antd.min.js',
    ],
    safelist: [
        'rounded-hub',
        'rounded-hub-card',
        'rounded-hub-shell',
        'rounded-r-hub-card',
        'rounded-b-hub-card',
        'hub-section-tabs',
        'shadow-sm',
    ],
    theme: {
        extend: {
            colors: {
                hub: {
                    primary: 'var(--hub-primary)',
                    secondary: 'var(--hub-secondary)',
                    cta: 'var(--hub-cta)',
                    bg: 'var(--hub-bg)',
                    surface: 'var(--hub-surface)',
                    border: 'var(--hub-border)',
                    'border-card': 'var(--hub-border-card)',
                    text: 'var(--hub-text)',
                    title: 'var(--hub-title)',
                    muted: 'var(--hub-muted)',
                    success: 'var(--hub-success)',
                    active: 'var(--hub-active)',
                },
                background: 'var(--hub-bg)',
            },
            borderRadius: {
                hub: '8px',
                'hub-card': '12px',
                'hub-shell': '24px',
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
