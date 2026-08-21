'use client';

import { Loading } from '@/components/common';
import { env } from '@/config';
import { CustomSpace } from '@/components/custom-antd';
import { SIDEBAR_ITEMS } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { MessageType } from '@/enums';
import { useCustomMutationData, useSearchParamsString } from '@/hooks';
import { exchangeCodeForTokens, findInformationPage, getUserInfoFromGoogle } from '@/libs';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, Suspense, useEffect, useRef, useState } from 'react';

import { Header } from './header';
import { NotificationsPanel } from './notifications-panel';
import { ScrollToTop } from './scroll-to-top';
import { Sidebar } from './sidebar';

export const MainLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const pathname = usePathname();
    const handledAuthRef = useRef(false);

    const searchParamsString = useSearchParamsString();
    const informationPage = findInformationPage(pathname, SIDEBAR_ITEMS);

    const { handleLoading, handleMessage } = useMainContext();
    const { handleCustomMutationData: syncGoogleAuth } = useCustomMutationData();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(searchParamsString as Record<string, string>);

        const code = params.get('code');
        const error = params.get('error');

        if (!code && !error) return;
        if (handledAuthRef.current) return;

        handledAuthRef.current = true;

        if (error) {
            handleMessage({ type: MessageType.ERROR, content: 'Kết nối Google thất bại' });
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
            const tokens = await exchangeCodeForTokens(code, env.googleRedirectUri as string);

            if (!tokens) {
                handleMessage({ type: MessageType.ERROR, content: 'Lỗi khi lấy token Google' });
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
        <main className="flex h-screen overflow-hidden animate-in fade-in duration-300 bg-hub-bg md:gap-3 md:p-3">
            <Sidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileMenuOpen}
                setCollapsed={setSidebarCollapsed}
                setMobileOpen={setMobileMenuOpen}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <Header
                    mobileMenuOpen={mobileMenuOpen}
                    sidebarCollapsed={sidebarCollapsed}
                    showNotifications={showNotifications}
                    pageTitle={informationPage?.label}
                    pageDescription={informationPage?.description}
                    setMobileMenuOpen={setMobileMenuOpen}
                    setShowNotifications={setShowNotifications}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                {showNotifications && (
                    <NotificationsPanel onClose={() => setShowNotifications(false)} />
                )}

                <Suspense fallback={<Loading />}>
                    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-auto max-md:pt-[4.25rem] max-md:px-3 max-md:pb-4 md:mt-4">
                        <CustomSpace size="middle" direction="vertical" className="w-full flex-1">
                            {children}
                        </CustomSpace>
                    </div>
                </Suspense>

                <ScrollToTop />
            </div>
        </main>
    );
};
