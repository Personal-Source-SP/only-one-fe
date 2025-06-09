import { HeroUIProvider } from '@heroui/react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const MainLayout = dynamic(() => import('@/components/layout'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'O-O Hub',
    description: 'Only One Hub',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body className={inter.className}>
                <main className="min-h-screen max-w-[100vw] w-full">
                    {/* <MainProvider> */}
                    {/* <AlbumProvider> */}
                    {/* <MacOsLayout>{children}</MacOsLayout> */}
                    <HeroUIProvider>
                        <MainLayout>{children}</MainLayout>
                    </HeroUIProvider>
                    {/* </AlbumProvider> */}
                    {/* </MainProvider> */}
                </main>
            </body>
        </html>
    );
}
