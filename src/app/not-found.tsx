import { Loading } from '@/components/common';
import NotFound from '@/components/common/not-found';
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
