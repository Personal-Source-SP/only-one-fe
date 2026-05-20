import { theme } from 'antd';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import RefineContext from '@/contexts/RefineContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { plusJakartaSans } from '@/constants';
import { cookies } from 'next/headers';
import { PropsWithChildren, Suspense } from 'react';

import '@/styles/globals.css';
import 'antd/dist/reset.css';

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

    const session = await getServerSession(authOptions);

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${plusJakartaSans.variable} ${plusJakartaSans.className} overflow-x-hidden`}
            >
                <Suspense>
                    <NavigationGuardProvider>
                        <AntdRegistry>
                            <RefineContext session={session} defaultMode={theme?.value}>
                                {children}
                            </RefineContext>
                        </AntdRegistry>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
