'use client';

import { Loading, UnsavedChangesNotifierAppRouter } from '@/components/common';
import { ColorModeContextProvider } from '@/contexts/ColorModeContext';
import accessControlProvider from '@/providers/access-control-provider';
import RestServer, { createSessionAxiosInstance } from '@/providers/data-provider';
import { DashboardOutlined } from '@ant-design/icons';
import { useNotificationProvider } from '@refinedev/antd';
import { AuthProvider, Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import dayjs from 'dayjs';
import { Session } from 'next-auth';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { env } from 'next-runtime-env';
import { redirect, usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

type RefineContextProps = {
    locale?: string;
    defaultMode?: string;
    session?: Session | null;
};

type AppProps = {
    locale?: string;
    defaultMode?: string;
};

const App = ({ children, defaultMode, locale }: PropsWithChildren<AppProps>) => {
    const { data: session, status } = useSession();

    const to = usePathname();
    const apiUrl = env('NEXT_PUBLIC_API_URL') || '';

    useEffect(() => {
        if (session?.expires && dayjs(session?.expires).isBefore(dayjs())) {
            signOut({
                redirect: true,
                callbackUrl: '/login',
            });
        }

        switch (status) {
            case 'authenticated': {
                window.location.href = '/dashboard';
                break;
            }
            case 'unauthenticated': {
                window.location.href = '/login';
                break;
            }
            default:
                break;
        }
    }, [session]);

    if (status === 'loading') {
        return <Loading />;
    }

    const authProvider: AuthProvider = {
        register: async ({ email, password, recaptchaToken }) => {
            const signUpResponse = await signIn('CredentialsSignUp', {
                email,
                password,
                recaptchaToken,
                redirect: true,
                callbackUrl: to ? to.toString() : '/',
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
        login: async ({ providerName, email, password, recaptchaToken }) => {
            if (providerName) {
                signIn(providerName, {
                    redirect: true,
                    callbackUrl: to ? to.toString() : '/',
                });

                return { success: true };
            }

            const signInResponse = await signIn('credentials', {
                email,
                password,
                recaptchaToken,
                redirect: false,
                callbackUrl: to ? to.toString() : '/',
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
                    redirectTo: '/',
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
