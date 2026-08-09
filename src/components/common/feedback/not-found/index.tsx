'use client';

import { CustomButton, CustomSpace } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export const NotFound = () => {
    const handleGoBack = () => {
        window.history.back();
    };

    // Note: Removed framer-motion animations

    const popularLinks = [
        { name: 'Dashboard', path: '/' },
        { name: 'Google Drive', path: '/drive' },
        { name: 'Google Photos', path: '/photos' },
        { name: 'Google Keep', path: '/keep' },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-content2 p-4">
            <CustomSpace
                direction="vertical"
                className="w-full max-w-3xl flex flex-col items-center"
            >
                {/* Illustration */}
                <div className="mb-8 text-primary">
                    <div className="relative">
                        <Icon icon="lucide:map-search" className="text-[150px] md:text-[200px]" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="text-4xl md:text-6xl font-bold text-primary-600">
                                404
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground-800">
                        Không tìm thấy trang
                    </h1>
                    <p className="text-lg text-foreground-600 max-w-lg mx-auto">
                        Có vẻ như trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy thử tìm
                        kiếm hoặc quay lại trang chủ.
                    </p>
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <CustomButton type="primary" size="large">
                        <Link href="/">
                            <span className="inline-flex items-center">
                                <Icon icon="lucide:home" className="mr-2" /> Quay về Trang chủ
                            </span>
                        </Link>
                    </CustomButton>
                    <CustomButton size="large" onClick={handleGoBack}>
                        <span className="inline-flex items-center">
                            <Icon icon="lucide:arrow-left" className="mr-2" /> Quay lại trang trước
                        </span>
                    </CustomButton>
                </div>

                {/* Popular links */}
                <div className="text-center">
                    <h2 className="text-lg font-medium mb-4 text-foreground-700">
                        Hoặc truy cập các trang phổ biến:
                    </h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {popularLinks.map((link, index) => (
                            <Link key={index} href={link.path} className="transition-all">
                                <CustomButton>{link.name}</CustomButton>
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
            </CustomSpace>
        </div>
    );
};
