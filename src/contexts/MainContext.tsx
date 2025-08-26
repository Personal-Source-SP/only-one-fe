'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { useFirebaseAuth } from '@/hooks/useFirebase';

import { queryClient } from '@/libs/react-query';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react';

interface MainContextType {
    loading: boolean;
    handleLoading: (loading: boolean) => void;
}

type MainProviderProps = PropsWithChildren<{
    isPublic?: boolean;
}>;

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<MainProviderProps> = ({ children, isPublic = false }) => {
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(true);

    const { firebaseLoading, isAuthenticated } = useFirebaseAuth();

    useEffect(() => {
        if (firebaseLoading) return;

        if (!isPublic && !isAuthenticated) {
            router.push('/login');
        }

        setLoading(false);
    }, [isPublic, isAuthenticated, firebaseLoading, pathname]);

    const renderChildren = () => {
        if (isPublic) {
            return <>{children}</>;
        }

        return (
            <QueryClientProvider client={queryClient}>
                <MainLayout>{children}</MainLayout>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        );
    };

    const handleLoading = (loading: boolean) => {
        setLoading(loading);
    };

    if (loading || firebaseLoading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                loading,
                handleLoading,
            }}
        >
            {renderChildren()}
        </MainContext.Provider>
    );
};

export const useMainContext = () => {
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error('useMainContext must be used within an MainProvider');
    }

    return context;
};
