import { Button, Link as HeroUILink } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FC } from 'react';

const Forbidden: FC = () => {
    const handleGoBack = () => {
        window.history.back();
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const lockVariants = {
        initial: { scale: 1 },
        animate: {
            scale: [1, 1.03, 1],
            rotate: [0, -2, 2, -2, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse' as const,
                ease: 'easeInOut',
            },
        },
    };

    const supportLinks = [
        { name: 'Trung tâm trợ giúp', path: '/' },
        { name: 'Quên mật khẩu', path: '/login' },
        { name: 'Đăng ký', path: '/login' },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-content2 p-4">
            {/* Logo in top left corner */}
            <div className="absolute top-6 left-6">
                <div className="flex items-center gap-2">
                    <Icon icon="logos:google" className="text-2xl" />
                    <span className="font-medium text-lg">Hub</span>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-3xl flex flex-col items-center"
            >
                {/* Illustration */}
                <motion.div
                    variants={lockVariants}
                    initial="initial"
                    animate="animate"
                    className="mb-8 text-danger"
                    aria-hidden="true"
                >
                    <div className="relative">
                        <div className="bg-danger-100 p-8 rounded-full">
                            <Icon
                                icon="lucide:lock"
                                className="text-[120px] md:text-[150px] text-danger"
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-6">
                            <span className="text-3xl md:text-5xl font-bold text-danger">403</span>
                        </div>
                    </div>
                </motion.div>

                {/* Main content */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-800">
                        Truy cập bị từ chối
                    </h1>
                    <p className="text-lg text-foreground-600 max-w-lg mx-auto">
                        Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập hoặc liên hệ
                        quản trị viên để được hỗ trợ.
                    </p>
                </motion.div>

                {/* CTA buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-md"
                >
                    <Button
                        color="primary"
                        size="lg"
                        startContent={<Icon icon="lucide:log-in" />}
                        fullWidth
                    >
                        <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button
                        variant="flat"
                        size="lg"
                        startContent={<Icon icon="lucide:home" />}
                        fullWidth
                    >
                        <Link href="/">Quay về Trang chủ</Link>
                    </Button>
                </motion.div>

                {/* Contact support button */}
                <motion.div variants={itemVariants} className="mb-8 w-full max-w-md">
                    <Button
                        color="danger"
                        variant="flat"
                        startContent={<Icon icon="lucide:help-circle" />}
                        fullWidth
                    >
                        Liên hệ hỗ trợ
                    </Button>
                </motion.div>

                {/* Support links */}
                <motion.div variants={itemVariants} className="text-center">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {supportLinks.map((link, index) => (
                            <HeroUILink
                                key={index}
                                color="primary"
                                underline="hover"
                                className="text-sm"
                            >
                                <Link href={link.path}>{link.name}</Link>
                            </HeroUILink>
                        ))}
                    </div>
                </motion.div>

                {/* Footer links */}
                <motion.div
                    variants={itemVariants}
                    className="mt-12 pt-6 border-t border-divider w-full flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-foreground-500"
                >
                    <Link href="/" className="hover:text-primary hover:underline">
                        Giới thiệu
                    </Link>
                    <Link href="/" className="hover:text-primary hover:underline">
                        Trợ giúp
                    </Link>
                    <Link href="/" className="hover:text-primary hover:underline">
                        Liên hệ
                    </Link>
                    <Link href="/" className="hover:text-primary hover:underline">
                        Điều khoản sử dụng
                    </Link>
                    <Link href="/" className="hover:text-primary hover:underline">
                        Chính sách bảo mật
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Forbidden;
