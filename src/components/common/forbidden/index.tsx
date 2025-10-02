import { Button, Space } from 'antd';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { FC } from 'react';

const Forbidden: FC = () => {
    const handleGoBack = () => {
        window.history.back();
    };

    // Note: Removed framer-motion animations

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

            <Space direction="vertical" className="w-full max-w-3xl flex flex-col items-center">
                {/* Illustration */}
                <div className="mb-8 text-danger" aria-hidden="true">
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
                </div>

                {/* Main content */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-800">
                        Truy cập bị từ chối
                    </h1>
                    <p className="text-lg text-foreground-600 max-w-lg mx-auto">
                        Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập hoặc liên hệ
                        quản trị viên để được hỗ trợ.
                    </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8 w-full max-w-md">
                    <Link href="/login" className="w-full">
                        <Button type="primary" size="large" className="w-full">
                            <span className="inline-flex items-center">
                                <Icon icon="lucide:log-in" className="mr-2" /> Đăng nhập
                            </span>
                        </Button>
                    </Link>
                    <Link href="/" className="w-full">
                        <Button size="large" className="w-full">
                            <span className="inline-flex items-center">
                                <Icon icon="lucide:home" className="mr-2" /> Quay về Trang chủ
                            </span>
                        </Button>
                    </Link>
                </div>

                {/* Contact support button */}
                <div className="mb-8 w-full max-w-md">
                    <Button danger size="large" className="w-full">
                        <span className="inline-flex items-center">
                            <Icon icon="lucide:help-circle" className="mr-2" /> Liên hệ hỗ trợ
                        </span>
                    </Button>
                </div>

                {/* Support links */}
                <div className="text-center">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {supportLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.path}
                                className="text-sm text-primary hover:underline"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer links */}
                <div className="mt-12 pt-6 border-t border-divider w-full flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-foreground-500">
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
                </div>
            </Space>
        </div>
    );
};

export default Forbidden;
