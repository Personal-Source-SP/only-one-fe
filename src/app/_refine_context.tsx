'use client';

import { Loading } from '@/components/common';
import { AuthProvider, Refine, ResourceProps } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

const App = ({ children }: PropsWithChildren) => {
    const { data, status } = useSession();

    const to = usePathname();

    if (status === 'loading') {
        return <Loading />;
    }

    const authProvider: AuthProvider = {
        login: async ({ providerName, email, password }: any) => {
            if (providerName) {
                signIn(providerName, {
                    callbackUrl: to ? to.toString() : '/',
                    redirect: true,
                });

                return {
                    success: true,
                };
            }

            const signUpResponse = await signIn('CredentialsSignUp', {
                email,
                password,
                callbackUrl: to ? to.toString() : '/',
                redirect: false,
            });

            if (!signUpResponse) {
                return {
                    success: false,
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
                error: new Error(error?.toString()),
            };
        },
        logout: async () => {
            signOut({
                redirect: true,
                callbackUrl: '/login',
            });

            return {
                success: true,
            };
        },
        onError: async (error: any) => {
            if (error.response?.status === 401) {
                return {
                    logout: true,
                };
            }

            return {
                error,
            };
        },
        check: async () => {
            if (status === 'unauthenticated') {
                return {
                    authenticated: false,
                    redirectTo: '/login',
                };
            }

            return {
                authenticated: true,
            };
        },
        getPermissions: async () => {
            return null;
        },
        getIdentity: async () => {
            if (data?.user) {
                const { user } = data;
                return {
                    name: user.name,
                    avatar: user.image,
                };
            }

            return null;
        },
    };

    const resources: ResourceProps[] = [
        {
            name: 'dashboard',
            list: '/',
        },
        {
            name: 'driver',
            list: '/driver',
        },
        {
            name: 'keep',
            list: '/keep',
        },
        {
            name: 'photos',
            list: '/photo',
        },
        {
            name: 'users',
            list: '/user',
        },
    ];

    return (
        <>
            <Refine
                // dataProvider={dataProvider}
                resources={resources}
                authProvider={authProvider}
                routerProvider={routerProvider}
                options={{
                    useNewQueryKeys: true,
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: false,
                }}
            >
                {children}
            </Refine>
        </>
    );
};

export const RefineContext = (props: PropsWithChildren) => {
    return (
        <SessionProvider>
            <App {...props} />
        </SessionProvider>
    );
};
