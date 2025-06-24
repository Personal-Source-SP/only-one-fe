'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { PATH_NOT_AUTH } from '@/constants';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auth } from '@/libs/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { usePathname } from 'next/navigation';
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
    handleLogout: () => Promise<void>;
    handleLogin: (email: string, password: string) => Promise<boolean>;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();

    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>('token');

    useEffect(() => {
        if (!PATH_NOT_AUTH.includes(pathname)) {
            getUserDetail();
        } else if (token) {
            setIsLoading(false);
            window.location.href = '/dashboard';
        } else {
            setIsLoading(false);
        }
    }, [pathname, token]);

    const renderChildren = () => {
        if (PATH_NOT_AUTH.includes(pathname)) {
            return <>{children}</>;
        }

        return <MainLayout>{children}</MainLayout>;
    };

    const getUserDetail = useCallback(async () => {
        setIsLoading(true);

        try {
            await auth.onAuthStateChanged((user) => {
                if (!user) {
                    window.location.href = '/login';
                }
            });
        } catch (error) {
            window.location.href = '/login';
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);

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
            setIsLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await auth.signOut();

        setToken(undefined);
        window.location.href = '/login';
    }, []);

    if (isLoading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                token,
                handleLogout,
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
