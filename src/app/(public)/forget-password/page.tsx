'use client';

import { CustomLink } from '@/components/custom';
import { AuthCard, ForgetPasswordForm } from '@/components/module/auth';

const ForgetPasswordPage = () => {
    return (
        <AuthCard
            footer={
                <p>
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
