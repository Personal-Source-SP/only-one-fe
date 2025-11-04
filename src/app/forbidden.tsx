import { Loading } from '@/components/common';
import Forbidden from '@/components/common/forbidden';
import { Suspense } from 'react';

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
