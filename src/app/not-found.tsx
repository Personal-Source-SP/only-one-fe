'use client';

import dynamic from 'next/dynamic';

const NotFound = dynamic(() => import('@/components/common/not-found'), {
    ssr: false,
});

export const metadata = {
    title: '404 - Not Found',
};

export default function NotFoundPage() {
    return (
        <html>
            <body className="bg-background">
                <NotFound />
            </body>
        </html>
    );
}
