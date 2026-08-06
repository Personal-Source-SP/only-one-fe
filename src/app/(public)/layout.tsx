import { AuthLayout } from '@/app/(public)/_components/auth';
import { MainProvider } from '@/contexts/MainContext';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
    description: 'Đăng nhập, đăng ký và khôi phục mật khẩu Only One Hub.',
};

export default async function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <MainProvider isPublic>
            <AuthLayout>{children}</AuthLayout>
        </MainProvider>
    );
}
