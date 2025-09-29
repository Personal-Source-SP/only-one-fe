'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';

import { queryClient } from '@/libs/react-query';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createContext, FC, PropsWithChildren, useContext, useState } from 'react';

interface MainContextType {
    loading: boolean;
    handleLoading: (loading: boolean) => void;
}

type MainProviderProps = PropsWithChildren<{
    isPublic?: boolean;
}>;

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<MainProviderProps> = ({ children, isPublic = false }) => {
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Loading />;

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
