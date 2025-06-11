'use client';

import Loading from '@/components/module/Loading';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auth } from '@/libs/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react';

interface MainContextType {
    token: string | undefined;
    handleLogout: () => Promise<void>;
    handleLogin: (email: string, password: string) => Promise<boolean>;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>('token');

    useEffect(() => {
        getUserDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getUserDetail = async () => {
        try {
            setIsLoading(true);

            await auth.onAuthStateChanged((user) => {
                if (user) {
                    router.push('/album');
                } else {
                    router.push('/');
                }
            });
        } catch (error) {
            router.push('/');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
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
    };

    const handleLogout = async () => {
        await auth.signOut();

        setToken(undefined);
        router.push('/');
    };

    const value = {
        token,
        handleLogout,
        handleLogin,
    };

    return isLoading ? (
        <Loading />
    ) : (
        <MainContext.Provider value={value}>{children}</MainContext.Provider>
    );
};

export const useMainContext = () => {
    const context = useContext(MainContext);

    if (context === undefined) {
        throw new Error('useMainContext must be used within an MainProvider');
    }

    return context;
};
