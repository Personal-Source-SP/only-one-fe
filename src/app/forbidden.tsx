import { Suspense } from 'react';

import { Forbidden, Loading } from '@/components';

export const metadata = {
    title: '403 - Forbidden',
};

export default function ForbiddenPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Forbidden />
        </Suspense>
    );
}
