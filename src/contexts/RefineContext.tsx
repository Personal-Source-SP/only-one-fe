'use client';

import { Loading, UnsavedChangesNotifierAppRouter } from '@/components/common';
import { AUTH_PUBLIC_PAGES } from '@/constants';
import { ColorModeContextProvider } from '@/contexts/ColorModeContext';
import accessControlProvider from '@/providers/access-control-provider';
import RestServer, { createSessionAxiosInstance } from '@/providers/data-provider';
import { DashboardOutlined } from '@ant-design/icons';
import { useNotificationProvider } from '@refinedev/antd';
import { AuthProvider, Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import { Session } from 'next-auth';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { env } from 'next-runtime-env';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';

type RefineContextProps = {
    defaultMode?: string;
    session?: Session | null;
};

type AppProps = {
    defaultMode?: string;
};

const App = ({ children, defaultMode }: PropsWithChildren<AppProps>) => {
    const { data: session, status } = useSession();

    const to = usePathname();
    const router = useRouter();
    const apiUrl = env('NEXT_PUBLIC_API_URL') || '';
    const isAuthPublicPage = AUTH_PUBLIC_PAGES.includes(to);

    const [isDomLoaded, setIsDomLoaded] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && isAuthPublicPage) {
            router.replace('/dashboard');
            return;
        }

        if (status === 'unauthenticated' && !isAuthPublicPage) {
            router.replace('/login');
            return;
        }

        setIsDomLoaded(true);
    }, [status, isAuthPublicPage, router]);

    if (status === 'loading' || !isDomLoaded) {
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
                return { success: false };
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
                error: new Error(error?.toString()),
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
                    error: new Error('Invalid credentials'),
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
            if (errorMessage) {
                return {
                    success: false,
                    error: new Error(errorMessage),
                };
            }

            return {
                success: false,
                error: new Error('Invalid credentials'),
            };
        },
        logout: async () => {
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
                notificationProvider={useNotificationProvider}
                dataProvider={RestServer(apiUrl, createSessionAxiosInstance(session))}
                resources={[
                    {
                        name: 'dashboard',
                        list: '/dashboard',
                        meta: {
                            icon: <DashboardOutlined />,
                            label: 'Dashboard',
                        },
                    },
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
                        list: '/forgot-password',
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

const RefineContext = (props: PropsWithChildren<RefineContextProps>) => {
    return (
        <SessionProvider session={props?.session} refetchInterval={120} refetchOnWindowFocus={true}>
            <App {...props} />
        </SessionProvider>
    );
};

export default RefineContext;
