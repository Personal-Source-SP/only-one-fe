'use client';

import { CustomLink } from '@/components/custom';
import { AuthCard } from '@/app/(public)/components/auth';

import { RegisterForm } from './components';

const RegisterPage = () => {
    return (
        <AuthCard
            footer={
                <p className="text-center text-sm text-hub-muted">
                    <span>Đã có tài khoản? </span>
                    <CustomLink href="/login">Đăng nhập</CustomLink>
                </p>
            }
            subtitle="Tạo tài khoản mới"
        >
            <RegisterForm />
        </AuthCard>
    );
};

export default RegisterPage;
