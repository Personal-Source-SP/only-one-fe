'use client';

import { Logo } from '@/components/common';
import { Button, Card, Input, Link } from '@heroui/react';
import { motion } from 'framer-motion';
import { FC, memo, useState } from 'react';

const ForgetPasswordPage: FC = () => {
    const [email, setEmail] = useState('');

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
                        <p className="text-foreground-600 text-center">Khôi phục mật khẩu</p>
                    </div>

                    <form className="w-full space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onValueChange={setEmail}
                        />
                        <Button color="primary" size="lg" className="w-full" type="submit">
                            Gửi liên kết khôi phục
                        </Button>
                    </form>

                    <p className="text-foreground-600 text-center mt-4">
                        Nhớ mật khẩu?{' '}
                        <Link href="/login" color="primary">
                            Đăng nhập
                        </Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default memo(ForgetPasswordPage);
