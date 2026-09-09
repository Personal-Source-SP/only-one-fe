'use client';

import { CustomLink, CustomTypography } from '@/components/custom-antd';
import { AuthCard } from '@/app/(public)/_components/auth';

import { RegisterForm } from './components';

const RegisterPage = () => {
    const pageContent = (
        <AuthCard
            footer={
                <p className="text-center text-sm text-hub-muted">
                    <CustomTypography.Text className="text-hub-muted">
                        Đã có tài khoản?{' '}
                    </CustomTypography.Text>
                    <CustomLink href="/login">Đăng nhập</CustomLink>
                </p>
            }
            subtitle="Tạo tài khoản mới để bắt đầu"
        >
            <RegisterForm />
        </AuthCard>
    );

    return pageContent;
};

export default RegisterPage;
