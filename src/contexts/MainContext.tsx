'use client';

import { Loading } from '@/components/common';
import MainLayout from '@/components/layout';
import { PATH_NOT_AUTH } from '@/constants';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NGoogleAuth, NUser } from '@/interfaces';
import { auth } from '@/libs/firebase';
import { PasswordService } from '@/libs/password';
import { queryClient } from '@/libs/react-query';
import { FirebaseDBService } from '@/services/firebase-db.service';
import { UserAuthService } from '@/services/user-auth.service';
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
    user: NUser.IUser | null;
    googleUser: NGoogleAuth.IGoogleUserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;

    handleLogout: () => Promise<void>;
    handleLogin: (email: string, password: string) => Promise<boolean>;
    handleGoogleLogin: () => Promise<boolean>;
    handleLoading: (loading: boolean) => void;
    checkUserInDatabase: (email: string) => Promise<NUser.IUser | null>;
    createUserInDatabase: (userData: NUser.ICreateUserData) => Promise<string>;

    // Password management
    updateUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
    resetUserPassword: (
        userId: string,
    ) => Promise<{ success: boolean; newPassword?: string; error?: string }>;

    // Google token management
    checkGoogleTokenStatus: () => Promise<{
        needsRefresh: boolean;
        isValid: boolean;
        newTokens?: any;
    }>;
    refreshGoogleToken: () => Promise<boolean>;

    // User management
    createUser: (userData: NUser.ICreateUserData) => Promise<string>;
    updateUser: (userId: string, userData: NUser.IUpdateUserData) => Promise<boolean>;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: FC<PropsWithChildren> = ({ children }) => {
    const pathname = usePathname();
    const params = useSearchParams();
    const googleCode = params.get('code');

    const [loading, setLoading] = useState(true);
    const [token, setToken] = useLocalStorage<string | undefined>('token');
    const [user, setUser] = useState<NUser.IUser | null>(null);
    const [googleToken, setGoogleToken] = useLocalStorage<string | undefined>('google_token');

    // Use Google Auth hook
    const {
        isAuthenticated: googleIsAuthenticated,
        user: googleUser,
        tokens: googleTokens,
        permissions: googlePermissions,
        loading: googleLoading,
        error: googleError,
        login: googleLogin,
        logout: googleLogout,
    } = useGoogleAuth();

    useEffect(() => {
        if (!PATH_NOT_AUTH.includes(pathname)) {
            getUserDetail();
        } else if (token || googleIsAuthenticated) {
            setLoading(false);
            window.location.href = '/dashboard';
        } else {
            setLoading(false);
        }
    }, [pathname, token, googleIsAuthenticated]);

    useEffect(() => {
        if (googleCode) {
            handleGoogleCallback(googleCode);
        }
    }, [googleCode]);

    const renderChildren = () => {
        if (PATH_NOT_AUTH.includes(pathname)) {
            return <>{children}</>;
        }

        return (
            <QueryClientProvider client={queryClient}>
                <MainLayout>{children}</MainLayout>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        );
    };

    const handleGoogleCallback = useCallback(async (googleCode: string) => {
        setLoading(true);
        try {
            // Sử dụng UserAuthService để xử lý Google login
            const result = await UserAuthService.loginWithGoogle(googleCode);

            if (result.success && result.user) {
                setUser(result.user);
                setGoogleToken(result.user.googleRefreshToken || undefined);
            } else {
                console.error('Google login failed:', result.error);
            }
        } catch (error) {
            console.error('Google callback error:', error);
        } finally {
            setLoading(false);
            window.location.href = '/dashboard';
        }
    }, []);

    const getUserDetail = useCallback(async () => {
        setLoading(true);

        try {
            // Check Firebase Auth
            await auth.onAuthStateChanged(async (firebaseUser) => {
                if (firebaseUser) {
                    // User is authenticated with Firebase
                    const dbUser = await checkUserInDatabase(firebaseUser.email || '');
                    if (dbUser) {
                        setUser(dbUser);
                        setLoading(false);
                    } else {
                        window.location.href = '/login';
                    }
                } else if (googleIsAuthenticated && googleUser) {
                    // User is authenticated with Google
                    const dbUser = await checkUserInDatabase(googleUser.email);
                    if (dbUser) {
                        setUser(dbUser);
                        setLoading(false);
                    } else {
                        window.location.href = '/login';
                    }
                } else {
                    window.location.href = '/login';
                }
            });
        } catch (error) {
            window.location.href = '/login';
        }
    }, [googleIsAuthenticated, googleUser]);

    const checkUserInDatabase = useCallback(async (email: string): Promise<NUser.IUser | null> => {
        try {
            const users = await FirebaseDBService.getDocuments<NUser.IUser>('users', {
                where: [{ field: 'email', operator: '==', value: email }],
                limit: 1,
            });

            if (users.length > 0) {
                const user = users[0];
                // Check if user is active
                if (user.isActive) {
                    return user;
                }
            }

            return null;
        } catch (error) {
            console.error('Error checking user in database:', error);
            return null;
        }
    }, []);

    const createUserInDatabase = useCallback(
        async (userData: NUser.ICreateUserData): Promise<string> => {
            try {
                const userId = await FirebaseDBService.addDocument<NUser.IUser>('users', {
                    ...userData,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                return userId;
            } catch (error) {
                console.error('Error creating user in database:', error);
                throw error;
            }
        },
        [],
    );

    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        setLoading(true);

        try {
            // Sử dụng UserAuthService để xử lý login
            const result = await UserAuthService.loginWithEmailPassword(email, password);

            if (result.success && result.user) {
                // Nếu user có Firebase UID, đăng nhập Firebase
                if (result.user.firebaseUid) {
                    try {
                        const userCredential = await signInWithEmailAndPassword(
                            auth,
                            email,
                            password,
                        );
                        if (userCredential?.user) {
                            const tokenFirebase = await userCredential.user.getIdToken();
                            setToken(tokenFirebase);
                        }
                    } catch (firebaseError) {
                        console.warn(
                            'Firebase login failed, but database login succeeded:',
                            firebaseError,
                        );
                    }
                }

                setUser(result.user);
                return true;
            } else {
                console.error('Login failed:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleGoogleLogin = useCallback(async (): Promise<boolean> => {
        try {
            googleLogin();
            return true;
        } catch (error) {
            console.error('Google login error:', error);
            return false;
        }
    }, [googleLogin]);

    const handleLogout = useCallback(async () => {
        try {
            // Sign out from Firebase
            await auth.signOut();

            // Sign out from Google
            if (googleIsAuthenticated) {
                await googleLogout();
            }

            // Clear all states
            setToken(undefined);
            setGoogleToken(undefined);
            setUser(null);

            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
    }, [googleIsAuthenticated, googleLogout]);

    const handleLoading = useCallback((loading: boolean) => {
        setLoading(loading);
    }, []);

    // Password management methods
    const updateUserPassword = useCallback(
        async (userId: string, newPassword: string): Promise<boolean> => {
            try {
                return await UserAuthService.updateUserPassword(userId, newPassword);
            } catch (error) {
                console.error('Error updating password:', error);
                return false;
            }
        },
        [],
    );

    const resetUserPassword = useCallback(async (userId: string) => {
        try {
            return await UserAuthService.resetUserPassword(userId);
        } catch (error) {
            console.error('Error resetting password:', error);
            return { success: false, error: 'Có lỗi xảy ra khi reset password' };
        }
    }, []);

    // Google token management methods
    const checkGoogleTokenStatus = useCallback(async () => {
        if (!user) {
            return { needsRefresh: false, isValid: false };
        }
        return await UserAuthService.checkUserGoogleTokenStatus(user);
    }, [user]);

    const refreshGoogleToken = useCallback(async (): Promise<boolean> => {
        if (!user?.googleRefreshToken) {
            return false;
        }
        try {
            const status = await UserAuthService.checkUserGoogleTokenStatus(user);
            if (status.needsRefresh && status.newTokens) {
                // Cập nhật tokens mới
                await UserAuthService.updateUserGoogleTokens(
                    user.id,
                    status.newTokens.access_token,
                    status.newTokens.refresh_token,
                    status.newTokens.expires_in,
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing Google token:', error);
            return false;
        }
    }, [user]);

    // User management methods
    const createUser = useCallback(async (userData: NUser.ICreateUserData): Promise<string> => {
        try {
            return await UserAuthService.createUserWithPassword(userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }, []);

    const updateUser = useCallback(
        async (userId: string, userData: NUser.IUpdateUserData): Promise<boolean> => {
            try {
                // Nếu có password, hash nó
                if (userData.password) {
                    const passwordHash = await PasswordService.hashPassword(userData.password);
                    userData = { ...userData, passwordHash };
                    delete userData.password;
                }

                await FirebaseDBService.updateDocument('users', userId, {
                    ...userData,
                    updatedAt: new Date(),
                });
                return true;
            } catch (error) {
                console.error('Error updating user:', error);
                return false;
            }
        },
        [],
    );

    if (loading || googleLoading) return <Loading />;

    return (
        <MainContext.Provider
            value={{
                token,
                googleToken,
                user,
                googleUser,
                isAuthenticated: !!token || googleIsAuthenticated,
                loading,
                handleLogout,
                handleLoading,
                handleLogin,
                handleGoogleLogin,
                checkUserInDatabase,
                createUserInDatabase,
                updateUserPassword,
                resetUserPassword,
                checkGoogleTokenStatus,
                refreshGoogleToken,
                createUser,
                updateUser,
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
