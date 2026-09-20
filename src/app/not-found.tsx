import { Suspense } from 'react';

import { Loading, NotFound } from '@/components';

export const metadata = {
    title: '404 - Not Found',
};

export default function NotFoundPage() {
    return (
        <Suspense fallback={<Loading />}>
            <NotFound />
        </Suspense>
    );
}
