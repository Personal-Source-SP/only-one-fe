import { Loading, NotFound } from '@/components';
import { Suspense } from 'react';

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
