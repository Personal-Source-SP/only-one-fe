'use client';

import { Logo } from '@/components/common';
import { useFirebaseAuth } from '@/hooks/useFirebase';
import { Button, Card, Checkbox, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FC, memo, useState } from 'react';

const LoginPage: FC = () => {
    const { handleLogin } = useFirebaseAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-content2 p-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-8 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Logo iconSize="3xl" textSize="2xl" />
                        </div>
                        <p className="text-foreground-600 text-center">
                            Không gian làm việc tập trung của bạn
                        </p>
                    </div>

                    <form className="w-full space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onValueChange={setEmail}
                            placeholder="Nhập email của bạn"
                        />
                        <Input
                            type="password"
                            label="Mật khẩu"
                            value={password}
                            onValueChange={setPassword}
                            placeholder="Nhập mật khẩu của bạn"
                        />
                        <div className="flex items-center justify-between">
                            <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                                Ghi nhớ đăng nhập
                            </Checkbox>
                            <Link href="/forget-password" color="primary">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <Button
                            size="lg"
                            type="submit"
                            color="primary"
                            className="w-full"
                            onPress={() => handleLogin(email, password)}
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="w-full flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-divider"></div>
                        <span className="text-foreground-500 text-sm">Hoặc</span>
                        <div className="flex-1 h-px bg-divider"></div>
                    </div>

                    <Button
                        size="lg"
                        color="default"
                        variant="flat"
                        className="w-full"
                        startContent={<Icon icon="logos:google-icon" />}
                    >
                        Đăng nhập với Google
                    </Button>

                    <p className="text-foreground-600 text-center mt-4">
                        <span>Chưa có tài khoản? </span>
                        <Link href="/register" color="primary">
                            Đăng ký ngay
                        </Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default memo(LoginPage);
