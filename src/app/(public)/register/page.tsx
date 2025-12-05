'use client';

import { Logo } from '@/components/common';
import { Button, Card, Input, Space } from 'antd';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { ChangeEvent, useState } from 'react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center bg-content2 p-4">
            <Space direction="vertical" className="w-full max-w-md">
                <Card className="p-8 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Logo iconSize="3xl" textSize="2xl" />
                        </div>
                        <p className="text-foreground-600 text-center">Tạo tài khoản mới</p>
                    </div>

                    <form className="w-full space-y-4">
                        <Input
                            type="text"
                            placeholder="Nhập họ và tên của bạn"
                            value={name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        />
                        <Input
                            type="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEmail(e.target.value)
                            }
                        />
                        <Input.Password
                            placeholder="Tạo mật khẩu mới"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setPassword(e.target.value)
                            }
                        />
                        <Input.Password
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setConfirmPassword(e.target.value)
                            }
                        />
                        <Button type="primary" size="large" className="w-full" htmlType="submit">
                            Đăng ký
                        </Button>
                    </form>

                    <div className="w-full flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-divider"></div>
                        <span className="text-foreground-500 text-sm">Hoặc</span>
                        <div className="flex-1 h-px bg-divider"></div>
                    </div>

                    <Button size="large" className="w-full">
                        <Icon icon="logos:google-icon" className="mr-2" /> Đăng ký với Google
                    </Button>

                    <p className="text-foreground-600 text-center mt-4">
                        Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
                    </p>
                </Card>
            </Space>
        </div>
    );
};

export default RegisterPage;
