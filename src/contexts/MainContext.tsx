'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';

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
    const [loading, setLoading] = useState(false);

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
            {isPublic ? children : <MainLayout>{children}</MainLayout>}
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
