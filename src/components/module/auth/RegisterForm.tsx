'use client';

import { IAuth } from '@/interfaces';
import { Button, Form, Input, notification } from 'antd';
import { useCallback } from 'react';

import AuthSocialLogin from './AuthSocialLogin';

const RegisterForm = () => {
    const [form] = Form.useForm<IAuth.IRegisterFormValues>();

    const handleRegister = useCallback(async (_values: IAuth.IRegisterFormValues) => {
        notification.info({
            message: 'Tính năng đang được phát triển',
            description: 'Đăng ký tài khoản sẽ sớm được hỗ trợ.',
        });
    }, []);

    return (
        <>
            <Form className="space-y-1" form={form} layout="vertical" onFinish={handleRegister}>
                <Form.Item
                    label="Họ và tên"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                    <Input placeholder="Nhập họ và tên của bạn" />
                </Form.Item>

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

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                    ]}
                >
                    <Input.Password placeholder="Tạo mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    dependencies={['password']}
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu" />
                </Form.Item>

                <Button block htmlType="submit" size="large" type="primary">
                    Đăng ký
                </Button>
            </Form>

            <AuthSocialLogin googleLabel="Đăng ký với Google" />
        </>
    );
};

export default RegisterForm;
