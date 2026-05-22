import { plusJakartaSans } from '@/constants';
import { AntdRegistryProvider } from '@/contexts';
import RefineContext from '@/contexts/RefineContext';
import { getSafeServerSession } from '@/libs/auth-session-helper';
import type { Metadata } from 'next';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { cookies } from 'next/headers';
import { PropsWithChildren, Suspense } from 'react';

import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'O-O Hub',
    description: 'Only One Hub',
    icons: {
        icon: '/favicon.ico',
    },
};

export default async function RootLayout({ children }: PropsWithChildren) {
    const cookieStore = await cookies();
    const theme = cookieStore.get('theme');

    const session = await getSafeServerSession();

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${plusJakartaSans.variable} ${plusJakartaSans.className} overflow-x-hidden`}
            >
                <Suspense>
                    <NavigationGuardProvider>
                        <AntdRegistryProvider>
                            <RefineContext session={session} defaultMode={theme?.value}>
                                {children}
                            </RefineContext>
                        </AntdRegistryProvider>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
