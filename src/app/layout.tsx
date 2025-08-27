import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { Inter } from 'next/font/google';
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

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className={`${inter.className} overflow-x-hidden`}>
                <Suspense>
                    <NavigationGuardProvider>
                        <AntdRegistry>{children}</AntdRegistry>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
