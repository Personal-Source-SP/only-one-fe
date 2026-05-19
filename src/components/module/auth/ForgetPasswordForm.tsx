'use client';

import { IAuth } from '@/interfaces';
import { Button, Form, Input, notification } from 'antd';
import { useCallback } from 'react';

const ForgetPasswordForm = () => {
    const handleSubmit = useCallback(async (_values: IAuth.IForgetPasswordFormValues) => {
        notification.success({
            message: 'Đã gửi liên kết khôi phục',
            description: 'Vui lòng kiểm tra hộp thư email của bạn.',
        });
    }, []);

    return (
        <Form className="space-y-1" layout="vertical" onFinish={handleSubmit}>
            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                ]}
            >
                <Input placeholder="Nhập email của bạn" type="email" />
            </Form.Item>

            <Button block htmlType="submit" size="large" type="primary">
                Gửi liên kết khôi phục
            </Button>
        </Form>
    );
};

export default ForgetPasswordForm;
