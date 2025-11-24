'use client';

import { Logo } from '@/components/common';
import { KEY_SESSION_STORAGE } from '@/constants';
import { Icon } from '@iconify/react';
import { useLogin } from '@refinedev/core';
import { Button, Checkbox, Form, Input, Space, notification } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LoginPage = () => {
    const { mutate: login, isPending } = useLogin();

    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        login(
            {
                email,
                password,
            },
            {
                onSuccess: (data) => {
                    if (data?.success) {
                        const returnUrl = sessionStorage.getItem(KEY_SESSION_STORAGE.RETURN_URL);
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
                        message: error?.message || 'Login failed. Please check your credentials.',
                    });
                },
            },
        );
    };

    return (
        <Space
            direction="vertical"
            className="min-h-screen flex items-center justify-center bg-white"
        >
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                    <Logo iconSize="3xl" textSize="2xl" />
                </div>
                <p className="text-foreground-600 text-center">
                    Không gian làm việc tập trung của bạn
                </p>
            </div>

            <Form className="w-full space-y-4" onFinish={handleLogin}>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                    <Input
                        value={email}
                        placeholder="Nhập email của bạn"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password
                        value={password}
                        placeholder="Nhập mật khẩu của bạn"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>
                <div className="flex items-center justify-between">
                    <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    >
                        Ghi nhớ đăng nhập
                    </Checkbox>
                    <Link href="/forget-password">Quên mật khẩu?</Link>
                </div>
                <Button
                    size="large"
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={isPending}
                >
                    Đăng nhập
                </Button>
            </Form>

            <div className="w-full flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-divider"></div>
                <span className="text-foreground-500 text-sm">Hoặc</span>
                <div className="flex-1 h-px bg-divider"></div>
            </div>

            <Button size="large" className="w-full">
                <Icon icon="logos:google-icon" className="mr-2" /> Đăng nhập với Google
            </Button>

            <p className="text-foreground-600 text-center mt-4">
                <span>Chưa có tài khoản? </span>
                <Link href="/register">Đăng ký ngay</Link>
            </p>
        </Space>
    );
};

export default LoginPage;
