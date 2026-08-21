'use client';

import { Loading, UnsavedChangesNotifierAppRouter } from '@/components/common';
import {
    AUTH_PUBLIC_PAGES,
    AUTH_REGISTER_UNKNOWN_FAILURE_MESSAGE,
    AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE,
    KEY_SESSION_STORAGE,
    mapNextAuthSignInErrorMessage,
} from '@/constants';
import { env } from '@/config';
import { ColorModeContextProvider } from '@/contexts/ColorModeContext';
import { accessControlProvider } from '@/providers/access-control-provider';
import { RestServer, createSessionAxiosInstance } from '@/providers/data-provider';
import { useNotificationProvider } from '@refinedev/antd';
import { AuthProvider, Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import dayjs from 'dayjs';
import { Session } from 'next-auth';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

type AppProps = {
    defaultMode?: string;
};

const App = ({ children, defaultMode }: PropsWithChildren<AppProps>) => {
    const { data: session, status } = useSession();

    const to = usePathname();
    const router = useRouter();
    const isAuthPublicPage = AUTH_PUBLIC_PAGES.includes(to);
    const apiUrl = env.apiUrl;

    const [sessionBootstrapComplete, setSessionBootstrapComplete] = useState(false);

    useEffect(() => {
        if (status === 'loading') {
            return;
        }

        if (status === 'authenticated' && isAuthPublicPage) {
            router.replace('/dashboard');
            return;
        }

        if (status === 'unauthenticated' && !isAuthPublicPage) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, to);
            }

            router.replace('/login');
            return;
        }

        const isTokenExpired = session?.expires ? dayjs(session.expires).isBefore(dayjs()) : false;
        if (isTokenExpired && !isAuthPublicPage) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, to);
            }

            signOut({
                redirect: true,
                callbackUrl: '/login',
            });
            return;
        }

        setSessionBootstrapComplete(true);
    }, [status, isAuthPublicPage, to, router, session]);

    const awaitingAuthRedirect =
        status !== 'loading' &&
        ((status === 'authenticated' && isAuthPublicPage) ||
            (status === 'unauthenticated' && !isAuthPublicPage));

    if (status === 'loading' || !sessionBootstrapComplete || awaitingAuthRedirect) {
        return <Loading />;
    }

    const authProvider: AuthProvider = {
        register: async ({ email, password, recaptchaToken }) => {
            const signUpResponse = await signIn('CredentialsSignUp', {
                email,
                password,
                recaptchaToken,
                redirect: true,
                callbackUrl: to ? to.toString() : '/dashboard',
            });

            if (!signUpResponse) {
                return {
                    success: false,
                    error: new Error(AUTH_REGISTER_UNKNOWN_FAILURE_MESSAGE),
                };
            }

            const { ok, error } = signUpResponse;

            if (ok) {
                return {
                    success: true,
                    redirectTo: '/',
                };
            }

            return {
                success: false,
                error: new Error(mapNextAuthSignInErrorMessage(error?.toString())),
            };
        },
        login: async ({ providerName, email, password }) => {
            if (providerName) {
                signIn(providerName, {
                    redirect: true,
                    callbackUrl: to ? to.toString() : '/dashboard',
                });

                return { success: true };
            }

            const signInResponse = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl: to ? to.toString() : '/dashboard',
            });

            if (!signInResponse) {
                return {
                    success: false,
                    error: new Error(AUTH_SIGN_IN_DEFAULT_FAILURE_MESSAGE),
                };
            }

            const { ok, error } = signInResponse;

            if (ok) {
                return {
                    success: true,
                    redirectTo: '/dashboard',
                };
            }

            const errorMessage = error?.toString() || '';

            return {
                success: false,
                error: new Error(mapNextAuthSignInErrorMessage(errorMessage)),
            };
        },
        logout: async () => {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, to);
            }
            signOut({
                redirect: true,
                callbackUrl: '/login',
            });

            return { success: true };
        },
        onError: async (error) => {
            if (error.response?.status === 401) {
                return { logout: true };
            }

            return { error };
        },
        check: async () => {
            if (status === 'unauthenticated') {
                return {
                    authenticated: false,
                    redirectTo: '/login',
                };
            }

            return { authenticated: true };
        },
        getPermissions: async () => {
            return [];
        },
        getIdentity: async () => {
            if (session?.user) {
                const { user } = session;

                return {
                    name: user.name,
                    avatar: user.image,
                };
            }

            return null;
        },
    };

    return (
        <ColorModeContextProvider defaultMode={defaultMode}>
            <Refine
                authProvider={authProvider}
                routerProvider={routerProvider}
                accessControlProvider={accessControlProvider}
                // eslint-disable-next-line react-compiler/react-compiler
                notificationProvider={useNotificationProvider}
                dataProvider={RestServer(apiUrl, createSessionAxiosInstance(session))}
                resources={[
                    {
                        name: 'login',
                        list: '/login',
                    },
                    {
                        name: 'register',
                        list: '/register',
                    },
                    {
                        name: 'forgot-password',
                        list: '/forget-password',
                    },
                ]}
                options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    projectId: 'a2b3c4d5-e6f7g8h9-i10j11k12',
                }}
            >
                {children}
                <UnsavedChangesNotifierAppRouter />
            </Refine>
        </ColorModeContextProvider>
    );
};

type RefineContextProps = {
    defaultMode?: string;
    session?: Session | null;
};

const RefineContext = (props: PropsWithChildren<RefineContextProps>) => (
    <SessionProvider session={props?.session} refetchInterval={120} refetchOnWindowFocus={true}>
        <App {...props} />
    </SessionProvider>
);

export default RefineContext;
