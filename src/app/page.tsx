'use client';

import Loading from '@/components/common/loading';
import { useMainContext } from '@/contexts/MainContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();

    const { token } = useMainContext();

    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [token, router]);

    return <Loading />;
}
