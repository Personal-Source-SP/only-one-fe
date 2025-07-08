'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { PATH_NOT_AUTH } from '@/constants';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auth } from '@/libs/firebase';
import { queryClient } from '@/libs/react-query';
import { GoogleAuthService } from '@/services';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    createContext,
    FC,
    PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

interface MainContextType {
    token: string | undefined;
    googleToken: string | undefined;

    handleLogout: () => Promise<void>;
    handleLogin: (email: string, password: string) => Promise<boolean>;

    loading: boolean;
    handleLoading: (loading: boolean) => void;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

const googleAuthService = new GoogleAuthService();

export const MainProvider: FC<PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();
    const params = useSearchParams();
    const googleCode = params.get('code');

    const [loading, setLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>('token');
    const [googleToken, setGoogleToken] = useLocalStorage<string | undefined>('google_token');

    useEffect(() => {
        if (!PATH_NOT_AUTH.includes(pathname)) {
            getUserDetail();
        } else if (token) {
            setLoading(false);
            window.location.href = '/dashboard';
        } else {
            setLoading(false);
        }
    }, [pathname, token]);

    useEffect(() => {
        if (googleCode) {
            getGoogleTokens(googleCode);
        }
    }, [googleCode]);

    const renderChildren = () => {
        if (PATH_NOT_AUTH.includes(pathname)) {
            return <>{children}</>;
        }

        return (
            <QueryClientProvider client={queryClient}>
                <MainLayout>{children}</MainLayout>;
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        );
    };

    const getGoogleTokens = useCallback(async (googleCode: string) => {
        try {
            const response = await googleAuthService.getGoogleTokens(googleCode);

            if (response.data) {
                setGoogleToken(response.data.access_token);
            } else {
                setGoogleToken(undefined);
            }
        } catch (error: unknown) {
            console.log(`get google tokens error: ${error}`);
            setGoogleToken(undefined);
        } finally {
            window.location.href = '/dashboard';
        }
    }, []);

    const getUserDetail = useCallback(async () => {
        setLoading(true);

        try {
            await auth.onAuthStateChanged((user) => {
                if (!user) {
                    window.location.href = '/login';
                }
            });
        } catch (error) {
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (userCredential?.user) {
                const tokenFirebase = await userCredential.user.getIdToken();
                setToken(tokenFirebase);

                return true;
            }

            return false;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await auth.signOut();

        setToken(undefined);
        window.location.href = '/login';
    }, []);

    const handleLoading = useCallback((loading: boolean) => {
        setLoading(loading);
    }, []);

    if (loading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                token,
                googleToken,
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
