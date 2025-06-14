'use client';

import { Logo } from '@/components/common';
import { Button, Card, Input, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { FC, memo, useState } from 'react';

const RegisterPage: FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <div className="min-h-screen flex items-center justify-center bg-content2 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
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
                            label="Họ và tên"
                            placeholder="Nhập họ và tên của bạn"
                            value={name}
                            onValueChange={setName}
                        />
                        <Input
                            type="email"
                            label="Email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onValueChange={setEmail}
                        />
                        <Input
                            type="password"
                            label="Mật khẩu"
                            placeholder="Tạo mật khẩu mới"
                            value={password}
                            onValueChange={setPassword}
                        />
                        <Input
                            type="password"
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onValueChange={setConfirmPassword}
                        />
                        <Button color="primary" size="lg" className="w-full" type="submit">
                            Đăng ký
                        </Button>
                    </form>

                    <div className="w-full flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-divider"></div>
                        <span className="text-foreground-500 text-sm">Hoặc</span>
                        <div className="flex-1 h-px bg-divider"></div>
                    </div>

                    <Button
                        color="default"
                        variant="flat"
                        size="lg"
                        className="w-full"
                        startContent={<Icon icon="logos:google-icon" />}
                    >
                        Đăng ký với Google
                    </Button>

                    <p className="text-foreground-600 text-center mt-4">
                        Đã có tài khoản?{' '}
                        <Link href="/login" color="primary">
                            Đăng nhập
                        </Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default memo(RegisterPage);
