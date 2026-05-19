'use client';

import { CustomButton, CustomForm, CustomInput } from '@/components/custom';
import { notification } from 'antd';
import { IAuth } from '@/interfaces';
import { useCallback } from 'react';

import { AuthSocialLogin } from './AuthSocialLogin';

export const RegisterForm = () => {
    const [form] = CustomForm.useForm<IAuth.IRegisterFormValues>();

    const handleRegister = useCallback(async (_values: IAuth.IRegisterFormValues) => {
        notification.info({
            message: 'Tính năng đang được phát triển',
            description: 'Đăng ký tài khoản sẽ sớm được hỗ trợ.',
        });
    }, []);

    return (
        <>
            <CustomForm
                className="space-y-1"
                form={form}
                layout="vertical"
                onFinish={handleRegister}
            >
                <CustomForm.Item
                    label="Họ và tên"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                    <CustomInput placeholder="Nhập họ và tên của bạn" />
                </CustomForm.Item>

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

                <CustomForm.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                    ]}
                >
                    <CustomInput.Password placeholder="Tạo mật khẩu mới" />
                </CustomForm.Item>

                <CustomForm.Item
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
                    <CustomInput.Password placeholder="Nhập lại mật khẩu" />
                </CustomForm.Item>

                <CustomButton block htmlType="submit" size="large" type="primary">
                    Đăng ký
                </CustomButton>
            </CustomForm>

            <AuthSocialLogin googleLabel="Đăng ký với Google" />
        </>
    );
};
