'use client';

import { Logo } from '@/components/common';
import { Icon } from '@iconify/react';
import { Button, Drawer, Menu, Tooltip } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { FC, memo, useMemo } from 'react';

interface SidebarItem {
    href: string;
    label: string;
    icon: string;
    checkAdmin?: boolean;
}

const sidebarItems: SidebarItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: 'lucide:layout-dashboard',
    },
    {
        href: '/drive',
        label: 'Google Drive',
        icon: 'logos:google-drive',
    },
    {
        href: '/photos',
        label: 'Google Photos',
        icon: 'logos:google-photos',
    },
    {
        href: '/keep',
        label: 'Google Keep',
        icon: 'logos:google-keep',
    },
    {
        href: '/users',
        label: 'Users',
        icon: 'lucide:users',
        checkAdmin: true,
    },
];

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

const Sidebar: FC<SidebarProps> = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }) => {
    const isAdmin = true;
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = (href: string) => {
        setMobileOpen(false);
        router.replace(href);
    };

    const menuItems = useMemo(
        () =>
            sidebarItems
                .filter((item) => !(item.checkAdmin && !isAdmin))
                .map((item) => ({
                    key: item.href,
                    icon: <Icon icon={item.icon} className="text-xl" />,
                    label: collapsed ? (
                        <span
                            title={item.label}
                            onClick={() => handleNavigation(item.href)}
                            className="flex items-center justify-center cursor-pointer w-full"
                        >
                            {item.label}
                        </span>
                    ) : (
                        <span
                            onClick={() => handleNavigation(item.href)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            {item.label}
                        </span>
                    ),
                })),
        [collapsed, handleNavigation, isAdmin, sidebarItems],
    );

    const menuItemsDesktop = useMemo(
        () =>
            sidebarItems
                .filter((item) => !(item.checkAdmin && !isAdmin))
                .map((item) => (
                    <li key={item.href}>
                        <Tooltip title={item.label} placement="right">
                            <Button
                                type="text"
                                shape="circle"
                                title={item.label}
                                onClick={() => handleNavigation(item.href)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                                    pathname === item.href
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-foreground-500 hover:bg-gray-100'
                                }`}
                            >
                                <Icon icon={item.icon} className="text-xl" />
                            </Button>
                        </Tooltip>
                    </li>
                )),
        [isAdmin, sidebarItems, pathname, handleNavigation],
    );

    const DesktopSidebar = () => (
        <div
            className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white border-r transition-all duration-300 ${
                collapsed ? 'md:w-16' : 'md:w-64'
            }`}
        >
            <div
                className={`flex items-center h-16 border-b border-divider ${
                    collapsed ? 'justify-center px-2' : 'justify-center px-4'
                }`}
            >
                <Logo iconSize="2xl" textSize={collapsed ? 'sm' : 'lg'} showText={!collapsed} />
            </div>

            {collapsed ? (
                <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <ul className="flex flex-col items-center gap-6">{menuItemsDesktop}</ul>
                </div>
            ) : (
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    <Menu
                        mode="inline"
                        items={menuItems}
                        selectedKeys={[pathname]}
                        inlineCollapsed={collapsed}
                        className={`border-none ${collapsed ? '[&_.ant-menu-item]:!justify-center [&_.ant-menu-item]:!px-2 [&_.ant-menu-item]:!w-full [&_.ant-menu-item]:!min-w-0' : ''}`}
                    />
                </nav>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center px-2 py-2 border-t border-divider">
                <Button
                    type="text"
                    size="large"
                    shape="circle"
                    className="hover:bg-gray-100"
                    onClick={() => setCollapsed(!collapsed)}
                    icon={
                        <Icon
                            className="text-xl"
                            icon={collapsed ? 'lucide:chevron-right' : 'lucide:chevron-left'}
                        />
                    }
                />
            </div>
        </div>
    );

    const MobileDrawer = () => (
        <Drawer
            width={300}
            zIndex={1050}
            closable={false}
            placement="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            className="md:hidden [&_.ant-drawer-body]:px-2"
            style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-divider">
                <div className="flex items-center gap-2 h-[32px] px-4">
                    <Logo iconSize="2xl" textSize="lg" />
                </div>
                <Button
                    type="text"
                    shape="circle"
                    aria-label="Close sidebar"
                    onClick={() => setMobileOpen(false)}
                    icon={<Icon icon="lucide:x" className="text-lg" />}
                    className="text-foreground-500 hover:text-foreground-700"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto [&_.ant-menu]:!border-none">
                <Menu mode="inline" items={menuItems} selectedKeys={[pathname]} />
            </nav>
        </Drawer>
    );

    return (
        <>
            <DesktopSidebar />
            <MobileDrawer />
        </>
    );
};

export default memo(Sidebar);
