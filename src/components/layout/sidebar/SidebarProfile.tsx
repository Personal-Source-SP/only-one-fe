'use client';

import {
    CustomAvatar,
    CustomButton,
    CustomDivider,
    CustomFlex,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import { KEY_SESSION_STORAGE } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { Theme } from '@/enums';
import { Icon } from '@iconify/react';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Fragment, useCallback } from 'react';

const COPYRIGHT_YEAR = new Date().getFullYear();

type SidebarProfileProps = {
    isCollapsed: boolean;
};

export const SidebarProfile = ({ isCollapsed }: SidebarProfileProps) => {
    const { theme } = useMainContext();
    const { data: session } = useSession();

    const pathname = usePathname();
    const isDark = [Theme.DARK, Theme.BRAND].includes(theme);

    const handleLogout = useCallback(() => {
        sessionStorage.setItem(KEY_SESSION_STORAGE.RETURN_URL, pathname);
        signOut({
            redirect: true,
            callbackUrl: '/login',
        });
    }, [pathname]);

    const getUserInitial = useCallback(() => {
        if (session?.user?.name) {
            return session.user.name.charAt(0).toUpperCase();
        }
        if (session?.user?.email) {
            return session.user.email.charAt(0).toUpperCase();
        }
        return 'U';
    }, [session]);

    const getUserName = useCallback(() => {
        return session?.user?.name || session?.user?.email || 'User';
    }, [session]);

    const getUserRole = useCallback(() => {
        return session?.user?.role || 'User';
    }, [session]);

    return (
        <div
            className={`border-t border-hub-border ${isDark ? 'bg-black/20' : 'bg-hub-section-muted/70'} ${isCollapsed ? 'md:p-2' : 'p-3'} pb-safe transition-colors`}
        >
            <CustomFlex
                align="center"
                gap={isCollapsed ? 0 : 12}
                justify={isCollapsed ? 'center' : 'flex-start'}
                className="group rounded-xl border border-hub-border-card/60 bg-hub-surface/80 p-2 shadow-sm transition-all hover:bg-hub-surface hover:border-hub-border hover:shadow-md active:bg-hub-section"
            >
                <CustomAvatar
                    size={36}
                    src={session?.user?.image}
                    className="flex-shrink-0 bg-hub-primary"
                >
                    {getUserInitial()}
                </CustomAvatar>
                {!isCollapsed && (
                    <Fragment>
                        <CustomSpace direction="vertical" size={0} className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate m-0 text-hub-title">
                                {getUserName()}
                            </p>
                            <p className="text-xs opacity-60 truncate m-0 text-hub-muted">
                                {getUserRole()}
                            </p>
                        </CustomSpace>
                        <CustomButton
                            type="text"
                            size="small"
                            onClick={handleLogout}
                            icon={<Icon icon="lucide:log-out" className="w-5 h-5 md:w-4 md:h-4" />}
                            className="opacity-50 hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        />
                    </Fragment>
                )}
            </CustomFlex>
            {!isCollapsed && (
                <footer aria-label="Copyright" className="mt-2">
                    <CustomDivider className="!mb-2.5 !border-hub-border/50" />
                    <CustomFlex align="center" gap={6} justify="center">
                        <CustomTypography.Text
                            type="secondary"
                            className="!m-0 !text-xs tabular-nums leading-tight"
                        >
                            &copy; {COPYRIGHT_YEAR}
                        </CustomTypography.Text>
                        <CustomTypography.Text
                            aria-hidden
                            type="secondary"
                            className="!m-0 !text-xs leading-tight opacity-50"
                        >
                            ·
                        </CustomTypography.Text>
                        <CustomTypography.Text
                            strong
                            type="secondary"
                            className="!m-0 !text-xs leading-tight"
                        >
                            O-O Hub
                        </CustomTypography.Text>
                    </CustomFlex>
                </footer>
            )}
        </div>
    );
};
