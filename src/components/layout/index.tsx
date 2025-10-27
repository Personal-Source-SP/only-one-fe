'use client';

import Header from '@/components/layout/header';
import NotificationsPanel from '@/components/layout/notifications-panel';
import Search from '@/components/layout/search';
import Sidebar from '@/components/layout/sidebar';

import { useMainContext } from '@/contexts/MainContext';
import { useCustomMutationData } from '@/hooks';
import { useSearchParamsString } from '@/hooks/useSearchParamsString';
import { exchangeCodeForTokens, getUserInfoFromGoogle } from '@/libs';

import { Space } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { FC, memo, ReactNode, useEffect, useRef, useState } from 'react';

type MainLayoutProps = {
    children: ReactNode;
};

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

const getPageTitle = (pathname: string) => {
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

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const handledAuthRef = useRef(false);
    const searchParamsString = useSearchParamsString();

    const [showSearch, setShowSearch] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const { handleLoading, handleMessage } = useMainContext();

    const { handleCustomMutationData: syncGoogleAuth } = useCustomMutationData();

    useEffect(() => {
        const params = new URLSearchParams(searchParamsString);

        const code = params.get('code');
        const error = params.get('error');

        if (!code && !error) return;
        if (handledAuthRef.current) return;

        handledAuthRef.current = true;

        if (error) {
            handleMessage('Kết nối Google thất bại', 'error');
            router.replace(pathname);
            return;
        }

        if (code) {
            Promise.resolve(handleSaveToken(code as string)).finally(() => {
                router.replace(pathname);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParamsString, pathname, router]);

    const handleSaveToken = async (code: string) => {
        handleLoading(true);

        try {
            const tokens = await exchangeCodeForTokens(
                code,
                process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI as string,
            );

            if (!tokens) {
                handleMessage('Lỗi khi lấy token Google', 'error');
                return;
            }

            const userInfo = await getUserInfoFromGoogle(tokens.access_token);
            if (!userInfo) {
                handleMessage('Lỗi khi lấy thông tin người dùng Google', 'error');
                return;
            }

            syncGoogleAuth({
                method: 'put',
                url: 'google-auth',
                values: {
                    email: userInfo.email,
                    accessToken: tokens.access_token,
                    expiresIn: tokens.expires_in,
                    scope: tokens.scope,
                    tokenType: tokens.token_type,
                    refreshToken: tokens.refresh_token,
                    refreshTokenExpiresIn: tokens.refresh_token_expires_in,
                },
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Kết nối Google thất bại',
                        } as const;
                    }

                    window.location.href = '/photos';

                    return {
                        type: 'success',
                        message: 'Kết nối Google thành công',
                    } as const;
                },
                errorNotification: () => {
                    return {
                        type: 'error',
                        message: 'Kết nối Google thất bại',
                    } as const;
                },
            });
        } catch (e) {
            handleMessage('Lỗi khi kết nối Google', 'error');
        } finally {
            handleLoading(false);
        }
    };

    return (
        <main className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                mobileOpen={mobileMenuOpen}
                setMobileOpen={setMobileMenuOpen}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            <div
                className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${
                    sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
                }`}
            >
                {/* Header */}
                <Header
                    showSearch={showSearch}
                    mobileMenuOpen={mobileMenuOpen}
                    sidebarCollapsed={sidebarCollapsed}
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
                <main className="flex-1 p-0 md:p-4 !pt-20 min-h-screen max-w-[100vw] w-full overflow-y-auto">
                    <Space size="middle" direction="vertical" className="p-4 mb-4 w-full h-full">
                        {children}
                    </Space>
                </main>

                {/* Quick Actions FAB */}
                {/* {!mobileMenuOpen && <QuickActions />} */}
            </div>
        </main>
    );
};

export default memo(MainLayout);
