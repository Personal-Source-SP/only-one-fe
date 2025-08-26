'use client';

import Loading from '@/components/common/loading';
import { useFirebaseAuth } from '@/hooks/useFirebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();

    const { token } = useFirebaseAuth();

    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [token, router]);

    return <Loading />;
}
