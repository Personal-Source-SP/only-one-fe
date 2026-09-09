'use client';

import { CustomLink, CustomTypography } from '@/components/custom-antd';
import { AuthCard } from '@/app/(public)/_components/auth';

import { ForgetPasswordForm } from './components';

const ForgetPasswordPage = () => {
    const pageContent = (
        <AuthCard
            footer={
                <p className="text-center text-sm text-hub-muted">
                    <CustomTypography.Text className="text-hub-muted">
                        Nhớ mật khẩu?{' '}
                    </CustomTypography.Text>
                    <CustomLink href="/login">Đăng nhập</CustomLink>
                </p>
            }
            subtitle="Nhập email để nhận liên kết khôi phục mật khẩu"
        >
            <ForgetPasswordForm />
        </AuthCard>
    );

    return pageContent;
};

export default ForgetPasswordPage;
