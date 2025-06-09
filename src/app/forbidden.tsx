'use client';

import dynamic from 'next/dynamic';

const Forbidden = dynamic(() => import('@/components/common/forbidden'), {
    ssr: false,
});

export const metadata = {
    title: '403 - Forbidden',
};

export default function NotFoundPage() {
    return (
        <html>
            <body className="bg-background">
                <Forbidden />
            </body>
        </html>
    );
}
