'use client';

import { CustomLink, CustomTypography } from '@/components/custom-antd';
import { AuthCard } from '@/app/(public)/_components/auth';

import { LoginForm } from './components';

const LoginPage = () => {
    const pageContent = (
        <AuthCard
            footer={
                <p className="text-center text-sm text-hub-muted">
                    <CustomTypography.Text className="text-hub-muted">
                        Chưa có tài khoản?{' '}
                    </CustomTypography.Text>
                    <CustomLink href="/register">Đăng ký ngay</CustomLink>
                </p>
            }
            subtitle="Không gian làm việc tập trung & tự động hoá"
        >
            <LoginForm />
        </AuthCard>
    );

    return pageContent;
};

export default LoginPage;
