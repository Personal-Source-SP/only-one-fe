import React from 'react';
import { CustomButton, CustomForm, CustomInput } from '@/components/custom';
import { useForgetPasswordPage } from '@/app/(public)/forget-password/hooks';

export const ForgetPasswordForm = () => {
    const { handleSubmit } = useForgetPasswordPage();

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
