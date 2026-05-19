'use client';

import { CustomButton, CustomForm, CustomInput } from '@/components/custom';
import { notification } from 'antd';
import { IAuth } from '@/interfaces';
import { useCallback } from 'react';

export const ForgetPasswordForm = () => {
    const handleSubmit = useCallback(async (_values: IAuth.IForgetPasswordFormValues) => {
        notification.success({
            message: 'Đã gửi liên kết khôi phục',
            description: 'Vui lòng kiểm tra hộp thư email của bạn.',
        });
    }, []);

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
