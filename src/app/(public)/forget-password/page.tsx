'use client';

import { CustomLink } from '@/components/custom-antd';
import { AuthCard } from '@/app/(public)/_components/auth';

import { ForgetPasswordForm } from './components';

const ForgetPasswordPage = () => {
    return (
        <AuthCard
            footer={
                <p className="text-center text-sm text-hub-muted">
                    <span>Nhớ mật khẩu? </span>
                    <CustomLink href="/login">Đăng nhập</CustomLink>
                </p>
            }
            subtitle="Nhập email để nhận liên kết khôi phục mật khẩu"
        >
            <ForgetPasswordForm />
        </AuthCard>
    );
};

export default ForgetPasswordPage;
