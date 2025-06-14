'use client';

import { Logo } from '@/components/common';
import { Button, Card } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { FC, useState } from 'react';

const LoginPage: FC = () => {
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);

        try {
            await signIn('google');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-content2 p-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-8 flex flex-col items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Logo iconSize="3xl" textSize="3xl" />
                        </div>
                        <p className="text-foreground-600 text-center">
                            Không gian làm việc tập trung của bạn
                        </p>
                    </div>

                    <Button
                        size="lg"
                        color="primary"
                        className="w-full"
                        isLoading={loading}
                        onPress={handleLogin}
                        startContent={<Icon icon="logos:google-icon" />}
                    >
                        Đăng nhập với Google
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
