'use client';

import { accessControlProvider } from '@/providers/access-control-provider';
import { authProvider } from '@/providers/auth-provider';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import { Session } from 'next-auth';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { PropsWithChildren, useEffect } from 'react';

type RefineContextProps = {
    defaultMode?: string;
    session?: Session | null;
};

const App = ({ children }: PropsWithChildren<RefineContextProps>) => {
    const { data: session, status } = useSession();

    console.log('alo', session, status);

    useEffect(() => {
        if ((session as any)?.error === 'AccessTokenExpired' || status === 'unauthenticated') {
            // signOut();
        }
    }, [session, status]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <Refine
            resources={[{ name: 'dashboard', list: '/' }]}
            authProvider={authProvider}
            routerProvider={routerProvider}
            accessControlProvider={accessControlProvider}
            options={{
                useNewQueryKeys: true,
                syncWithLocation: true,
                projectId: 'a2b3c4d5-e6f7g8h9-i10j11k12',
            }}
        >
            {children}
        </Refine>
    );
};

export const RefineContext = (props: PropsWithChildren<RefineContextProps>) => {
    return (
        <SessionProvider session={props?.session} refetchInterval={120} refetchOnWindowFocus={true}>
            <App {...props} />
        </SessionProvider>
    );
};
