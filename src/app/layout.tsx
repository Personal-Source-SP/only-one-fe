import { RefineContext } from '@/app/_refine_context';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { ReactNode, Suspense } from 'react';

import '@/styles/globals.css';
import 'antd/dist/reset.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'O-O Hub',
    description: 'Only One Hub',
    icons: {
        icon: '/favicon.ico',
    },
};

export default async function RootLayout({
    children,
    params: { locale },
}: {
    children: ReactNode;
    params: { locale: string };
}) {
    const cookieStore = cookies();
    const theme = cookieStore.get('theme');

    const session = await getServerSession(authOptions);

    return (
        <html lang="en">
            <body className={`${inter.className} overflow-x-hidden`}>
                <Suspense>
                    <NavigationGuardProvider>
                        <AntdRegistry>
                            <RefineContext
                                locale={locale}
                                session={session}
                                defaultMode={theme?.value}
                            >
                                {children}
                            </RefineContext>
                        </AntdRegistry>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
