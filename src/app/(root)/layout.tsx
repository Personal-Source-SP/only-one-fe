import { ReactNode } from 'react';

import { MainProvider } from '@/contexts/MainContext';

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <MainProvider>
            <main className="min-h-screen max-h-screen max-w-[100vw] w-full">{children}</main>
        </MainProvider>
    );
}
