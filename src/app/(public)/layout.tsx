import { AuthLayout } from '@/components/module/auth';
import { MainProvider } from '@/contexts/MainContext';
import { ReactNode } from 'react';

export default async function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <MainProvider isPublic>
            <AuthLayout>{children}</AuthLayout>
        </MainProvider>
    );
}
