import { Button, Input } from 'antd';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FC, FormEvent, useState } from 'react';

const NotFound: FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
    };

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

    const iconVariants = {
        initial: { scale: 1 },
        animate: {
            scale: [1, 1.05, 1],
            rotate: [0, -5, 5, -5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse' as const,
            },
        },
    };

    const popularLinks = [
        { name: 'Dashboard', path: '/' },
        { name: 'Google Drive', path: '/drive' },
        { name: 'Google Photos', path: '/photos' },
        { name: 'Google Keep', path: '/keep' },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-content2 p-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-3xl flex flex-col items-center"
            >
                {/* Illustration */}
                <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                    className="mb-8 text-primary"
                >
                    <div className="relative">
                        <Icon icon="lucide:map-search" className="text-[150px] md:text-[200px]" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="text-4xl md:text-6xl font-bold text-primary-600">
                                404
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Main content */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-800">
                        Không tìm thấy trang
                    </h1>
                    <p className="text-lg text-foreground-600 max-w-lg mx-auto">
                        Có vẻ như trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy thử tìm
                        kiếm hoặc quay lại trang chủ.
                    </p>
                </motion.div>

                {/* CTA buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-3 mb-8"
                >
                    <Button type="primary" size="large">
                        <Link href="/">
                            <span className="inline-flex items-center">
                                <Icon icon="lucide:home" className="mr-2" /> Quay về Trang chủ
                            </span>
                        </Link>
                    </Button>
                    <Button size="large" onClick={handleGoBack}>
                        <span className="inline-flex items-center">
                            <Icon icon="lucide:arrow-left" className="mr-2" /> Quay lại trang trước
                        </span>
                    </Button>
                </motion.div>

                {/* Popular links */}
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-lg font-medium mb-4 text-foreground-700">
                        Hoặc truy cập các trang phổ biến:
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {popularLinks.map((link, index) => (
                            <Link key={index} href={link.path} className="transition-all">
                                <Button>{link.name}</Button>
                            </Link>
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

export default NotFound;
