'use client';

import { CustomSpace } from '@/components/custom';
import { Loading, ScrollToTop } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { useSearchParamsString } from '@/hooks';
import { exchangeCodeForTokens, findInformationPage, getUserInfoFromGoogle } from '@/libs';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, Suspense, useEffect, useRef, useState } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { NotificationsPanel } from '@/components/layout/notifications-panel';
import { Search } from '@/components/layout/search';
import { Sidebar } from '@/components/layout/sidebar';

export const MainLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();
    const handledAuthRef = useRef(false);
    const searchParamsString = useSearchParamsString();
    const informationPage = findInformationPage(pathname, SIDEBAR_ITEMS);

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
                type: MessageType.ERROR,
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
                    type: MessageType.ERROR,
                    content: 'Lỗi khi lấy token Google',
                });
                return;
            }

            const userInfo = await getUserInfoFromGoogle(tokens.access_token);
            if (!userInfo) {
                handleMessage({
                    type: MessageType.ERROR,
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
                            type: MessageType.ERROR,
                            message: 'Kết nối Google thất bại',
                        } as const;
                    }

                    window.location.href = '/photos';

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Kết nối Google thành công',
                    } as const;
                },
                errorNotification: () => {
                    return {
                        type: MessageType.ERROR,
                        message: 'Kết nối Google thất bại',
                    } as const;
                },
            });
        } catch (e) {
            handleMessage({
                type: MessageType.ERROR,
                content: 'Lỗi khi kết nối Google',
            });
        } finally {
            handleLoading(false);
        }
    };

    return (
        <main className="flex h-screen bg-background overflow-hidden animate-in fade-in duration-300">
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
                    <main className="flex-1 p-0 md:p-4 !pt-20 min-h-screen max-w-[100vw] w-full flex flex-col overflow-hidden">
                        <CustomSpace
                            size="middle"
                            direction="vertical"
                            className="p-0 md:p-4 mb-4 w-full flex-1"
                        >
                            {informationPage && (
                                <CustomSpace direction="vertical" size={4} className="px-4 md:px-0">
                                    <h1 className="text-xl sm:text-2xl font-bold !m-0">
                                        {informationPage?.label}
                                    </h1>
                                    {informationPage?.description && (
                                        <p className="text-sm sm:text-base opacity-70 !m-0">
                                            {informationPage?.description}
                                        </p>
                                    )}
                                </CustomSpace>
                            )}
                            {children}
                        </CustomSpace>
                        <div className="shrink-0">
                            <Footer />
                        </div>
                    </main>
                </Suspense>

                {/* Scroll to Top */}
                <ScrollToTop />
            </div>
        </main>
    );
};
