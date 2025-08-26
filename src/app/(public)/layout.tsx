import { MainProvider } from '@/contexts/MainContext';
import { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <MainProvider isPublic>
            <main className="min-h-screen max-h-screen max-w-[100vw] w-full">{children}</main>
        </MainProvider>
    );
}
