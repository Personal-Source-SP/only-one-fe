'use client';

import { CustomLink } from '@/components/custom';
import { KEY_SESSION_STORAGE } from '@/constants';
import { IAuth } from '@/interfaces';
import { useLogin } from '@refinedev/core';
import { Button, Checkbox, Form, Input, notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import AuthSocialLogin from './AuthSocialLogin';

const LoginForm = () => {
    const { isPending, mutate: login } = useLogin();

    const router = useRouter();

    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = useCallback(
        async (values: IAuth.ILoginRequest) => {
            login(
                {
                    email: values.email,
                    password: values.password,
                },
                {
                    onSuccess: (data) => {
                        if (data?.success) {
                            const returnUrl = sessionStorage.getItem(
                                KEY_SESSION_STORAGE.RETURN_URL,
                            );
                            if (returnUrl) {
                                sessionStorage.removeItem(KEY_SESSION_STORAGE.RETURN_URL);
                                router.push(returnUrl);
                            } else {
                                router.push('/dashboard');
                            }
                        }
                    },
                    onError: (error) => {
                        notification.error({
                            message:
                                error?.message ||
                                'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.',
                        });
                    },
                },
            );
        },
        [login, router],
    );

    return (
        <>
            <Form className="space-y-1" layout="vertical" onFinish={handleLogin}>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                    <Input placeholder="Nhập email của bạn" type="email" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu của bạn" />
                </Form.Item>

                <div className="mb-4 flex items-center justify-between">
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    >
                        Ghi nhớ đăng nhập
                    </Checkbox>
                    <CustomLink href="/forget-password">Quên mật khẩu?</CustomLink>
                </div>
                <Button block htmlType="submit" loading={isPending} size="large" type="primary">
                    Đăng nhập
                </Button>
            </Form>

            <AuthSocialLogin googleLabel="Đăng nhập với Google" />
        </>
    );
};

export default LoginForm;
