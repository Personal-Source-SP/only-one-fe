'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { KEY_LOCAL_STORAGE } from '@/constants';
import { useFirebaseAuth } from '@/hooks/useFirebase';

import { useLocalStorage } from '@/hooks/useLocalStorage';

import { auth } from '@/libs/firebase';

import { queryClient } from '@/libs/react-query';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react';

interface MainContextType {
    token: string | undefined;

    handleLogout: () => Promise<void>;
    handleLogin: (email: string, password: string) => Promise<boolean>;

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

    const { loading: firebaseLoading, isAuthenticated } = useFirebaseAuth();

    const [loading, setLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>(KEY_LOCAL_STORAGE.FIREBASE_TOKEN);

    useEffect(() => {
        if (firebaseLoading) return;

        if (!isPublic && (!isAuthenticated || !token)) {
            router.push('/login');
        }

        setLoading(false);
    }, [isPublic, isAuthenticated, firebaseLoading, pathname, token]);

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

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (userCredential?.user) {
                const tokenFirebase = await userCredential.user.getIdToken();
                setToken(tokenFirebase);

                router.push('/dashboard');

                return true;
            }

            return false;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();

        setToken(undefined);
        window.location.href = '/login';
    };

    const handleLoading = (loading: boolean) => {
        setLoading(loading);
    };

    if (loading || firebaseLoading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                token,
                handleLogout,
                handleLoading,
                loading,
                handleLogin,
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
