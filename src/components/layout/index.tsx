'use client';

import { Loading, ScrollToTop } from '@/components/common';

import Header from '@/components/layout/header';
import NotificationsPanel from '@/components/layout/notifications-panel';
import Search from '@/components/layout/search';
import Sidebar from '@/components/layout/sidebar';

import { SIDEBAR_ITEMS } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { useCustomMutationData } from '@/hooks';
import { useSearchParamsString } from '@/hooks/useSearchParamsString';
import { SidebarItem } from '@/interfaces';
import { exchangeCodeForTokens, getUserInfoFromGoogle } from '@/libs';

import { Space } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import Breadcrumb from './breadcrumb';

type MainLayoutProps = {
    children: ReactNode;
};

const findPageTitle = (pathname: string, items: SidebarItem[]): string | null => {
    for (const item of items) {
        if (item.href === pathname) {
            return item.label;
        }

        if (item.children) {
            const found = findPageTitle(pathname, item.children);
            if (found) {
                return found;
            }
        }
    }

    return null;
};

export const getPageTitle = (pathname: string, items?: SidebarItem[]): string => {
    const found = findPageTitle(pathname, items || SIDEBAR_ITEMS);
    return found || 'O-O Hub';
};

const MainLayout = ({ children }: MainLayoutProps) => {
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
            handleMessage({
                type: 'error',
                content: 'Kết nối Google thất bại',
            });
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
                handleMessage({
                    type: 'error',
                    content: 'Lỗi khi lấy token Google',
                });
                return;
            }

            const userInfo = await getUserInfoFromGoogle(tokens.access_token);
            if (!userInfo) {
                handleMessage({
                    type: 'error',
                    content: 'Lỗi khi lấy thông tin người dùng Google',
                });
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
            handleMessage({
                type: 'error',
                content: 'Lỗi khi kết nối Google',
            });
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
                    <NotificationsPanel onClose={() => setShowNotifications(false)} />
                )}

                {/* Mobile search bar */}
                <Search showSearch={showSearch} setShowSearch={setShowSearch} />

                {/* Page Content */}
                <Suspense fallback={<Loading />}>
                    <main className="flex-1 p-0 md:p-4 !pt-20 min-h-screen max-w-[100vw] w-full overflow-y-auto">
                        <Space
                            size="middle"
                            direction="vertical"
                            className="p-4 mb-4 w-full h-full"
                        >
                            <Breadcrumb />
                            {children}
                        </Space>
                    </main>
                </Suspense>

                {/* Scroll to Top */}
                <ScrollToTop />
            </div>
        </main>
    );
};

export default MainLayout;
