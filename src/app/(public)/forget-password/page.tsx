'use client';

import { CustomButton, CustomForm, CustomInput, CustomLink } from '@/components/custom';
import { AuthCard } from '@/app/(public)/components/auth';
import { useMainContext } from '@/contexts/MainContext';
import { IAuth } from '@/interfaces';
import { useCallback } from 'react';

const ForgetPasswordForm = () => {
    const { handleNotification } = useMainContext();

    const handleSubmit = useCallback(
        async (_values: IAuth.IForgetPasswordFormValues) => {
            handleNotification({
                message: 'Đã gửi liên kết khôi phục',
                description: 'Vui lòng kiểm tra hộp thư email của bạn.',
            });
        },
        [handleNotification],
    );

    return (
        <CustomForm className="space-y-1" layout="vertical" onFinish={handleSubmit}>
            <CustomForm.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                ]}
            >
                <CustomInput placeholder="Nhập email của bạn" type="email" />
            </CustomForm.Item>

            <CustomButton block htmlType="submit" size="large" type="primary">
                Gửi liên kết khôi phục
            </CustomButton>
        </CustomForm>
    );
};

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
