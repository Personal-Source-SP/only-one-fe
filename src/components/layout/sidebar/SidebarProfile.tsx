'use client';

import { KEY_SESSION_STORAGE } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { Theme } from '@/enums';
import { Icon } from '@iconify/react';
import { Avatar, Button, Flex, Space } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Fragment, useCallback } from 'react';

type SidebarProfileProps = {
    isCollapsed: boolean;
};

const SidebarProfile = ({ isCollapsed }: SidebarProfileProps) => {
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
            className={`border-t border-slate-100/10 ${isDark ? 'bg-black/10' : 'bg-slate-50/50'} ${isCollapsed ? 'md:p-2' : 'p-4'} pb-safe`}
        >
            <Flex
                align="center"
                gap={isCollapsed ? 0 : 12}
                justify={isCollapsed ? 'center' : 'flex-start'}
                className="p-2 rounded-xl hover:bg-white/10 transition-all border border-transparent active:bg-black/20 group"
            >
                <Avatar
                    size={36}
                    src={session?.user?.image}
                    className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600"
                >
                    {getUserInitial()}
                </Avatar>
                {!isCollapsed && (
                    <Fragment>
                        <Space direction="vertical" size={0} className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate m-0">{getUserName()}</p>
                            <p className="text-xs opacity-50 truncate m-0">{getUserRole()}</p>
                        </Space>
                        <Button
                            type="text"
                            size="small"
                            onClick={handleLogout}
                            icon={<Icon icon="lucide:log-out" className="w-5 h-5 md:w-4 md:h-4" />}
                            className="opacity-40 hover:opacity-100 hover:text-rose-500 transition-all"
                        />
                    </Fragment>
                )}
            </Flex>
        </div>
    );
};

export default SidebarProfile;
