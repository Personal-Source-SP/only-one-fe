'use client';

import Header from '@/components/layout/header';
import NotificationsPanel from '@/components/layout/notifications-panel';
import Search from '@/components/layout/search';
import Sidebar from '@/components/layout/sidebar';
import QuickActions from '@/components/module/quick-actions';
import { usePathname } from 'next/navigation';
import { FC, memo, ReactNode, useState } from 'react';

type MainLayoutProps = {
    children: ReactNode;
};

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    const [showSearch, setShowSearch] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Mock notifications data
    const notifications = [
        {
            id: 1,
            type: 'share',
            title: 'Hương Trần đã chia sẻ một tệp với bạn',
            message: 'Báo cáo doanh thu Q2 2023.xlsx',
            time: '5 phút trước',
            read: false,
            user: {
                name: 'Hương Trần',
                avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=2',
            },
        },
        {
            id: 2,
            type: 'comment',
            title: 'Tuấn Nguyễn đã bình luận về tài liệu của bạn',
            message: 'Tôi đã xem qua và có một vài ý kiến...',
            time: '30 phút trước',
            read: false,
            user: {
                name: 'Tuấn Nguyễn',
                avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=3',
            },
        },
        {
            id: 3,
            type: 'mention',
            title: 'Linh Đỗ đã nhắc đến bạn trong một bình luận',
            message: '@Minh Nguyễn bạn có thể kiểm tra lại số liệu này không?',
            time: '2 giờ trước',
            read: true,
            user: {
                name: 'Linh Đỗ',
                avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=4',
            },
        },
        {
            id: 4,
            type: 'update',
            title: 'Cập nhật hệ thống',
            message: 'Google Hub đã được cập nhật lên phiên bản mới nhất.',
            time: '1 ngày trước',
            read: true,
            user: {
                name: 'Hệ thống',
                avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=10',
            },
        },
    ];

    // Get current page title based on path
    const getPageTitle = () => {
        switch (pathname) {
            case '/':
                return 'Bảng điều khiển';
            case '/drive':
                return 'Google Drive';
            case '/photos':
                return 'Google Photos';
            case '/keep':
                return 'Google Keep';
            case '/users':
                return 'Quản lý người dùng';
            default:
                return 'Google Hub';
        }
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header
                    showSearch={showSearch}
                    mobileMenuOpen={mobileMenuOpen}
                    showNotifications={showNotifications}
                    getPageTitle={getPageTitle}
                    setShowSearch={setShowSearch}
                    setMobileMenuOpen={setMobileMenuOpen}
                    setShowNotifications={setShowNotifications}
                />

                {/* Notifications Panel */}
                {showNotifications && (
                    <NotificationsPanel
                        notifications={notifications as any}
                        onClose={() => setShowNotifications(false)}
                    />
                )}

                {/* Mobile search bar */}
                <Search showSearch={showSearch} setShowSearch={setShowSearch} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-3 md:p-6">{children}</main>

                {/* Quick Actions FAB */}
                <QuickActions />
            </div>
        </div>
    );
};

export default memo(MainLayout);
