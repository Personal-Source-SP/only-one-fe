'use client';

import { CustomLink } from '@/components/custom';
import { AuthCard, LoginForm } from '@/components/module/auth';

const LoginPage = () => {
    return (
        <AuthCard
            footer={
                <p>
                    <span>Chưa có tài khoản? </span>
                    <CustomLink href="/register">Đăng ký ngay</CustomLink>
                </p>
            }
            subtitle="Không gian làm việc tập trung của bạn"
        >
            <LoginForm />
        </AuthCard>
    );
};

export default LoginPage;
