import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { RefineContext } from '@/contexts/RefineContext';
import { HeroUIProvider } from '@heroui/react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { NavigationGuardProvider } from 'next-navigation-guard';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const MainLayout = dynamic(() => import('@/components/layout'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'O-O Hub',
    description: 'Only One Hub',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className={inter.className}>
                <main className="min-h-screen max-w-[100vw] w-full">
                    {/* <MainProvider> */}
                    {/* <AlbumProvider> */}
                    <NavigationGuardProvider>
                        <RefineContext session={session}>
                            <HeroUIProvider>
                                <MainLayout>{children}</MainLayout>
                            </HeroUIProvider>
                        </RefineContext>
                    </NavigationGuardProvider>
                    {/* </AlbumProvider> */}
                    {/* </MainProvider> */}
                </main>
            </body>
        </html>
    );
}
