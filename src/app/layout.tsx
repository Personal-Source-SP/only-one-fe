import { HeroUIProvider } from '@heroui/react';
import type { Metadata } from 'next';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { Inter } from 'next/font/google';
import { ReactNode, Suspense } from 'react';

import { MainProvider } from '@/contexts/MainContext';
import '@/styles/globals.css';

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
            <body className={inter.className}>
                <Suspense>
                    <NavigationGuardProvider>
                        <HeroUIProvider>
                            <MainProvider>
                                <main className="min-h-screen max-w-[100vw] w-full">
                                    {children}
                                </main>
                            </MainProvider>
                        </HeroUIProvider>
                    </NavigationGuardProvider>
                </Suspense>
            </body>
        </html>
    );
}
