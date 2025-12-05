'use client';

import { Logo } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import { Icon } from '@iconify/react';
import { Button, Drawer, Menu, Tooltip } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) => {
    const isAdmin = true;
    const router = useRouter();
    const pathname = usePathname();

    const [openKeys, setOpenKeys] = useState<string[]>([]);

    const handleNavigation = useCallback(
        (href: string) => {
            setMobileOpen(false);
            router.replace(href);
        },
        [router, setMobileOpen],
    );

    const handleSubMenuToggle = useCallback(
        (key: string) => {
            setOpenKeys((prev) =>
                prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
            );
        },
        [setOpenKeys],
    );

    const menuItems = useMemo(
        () =>
            SIDEBAR_ITEMS.filter((item) => !(item.checkAdmin && !isAdmin)).map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const hasHref = item.href !== undefined;

                if (hasChildren) {
                    return {
                        key: item.href || `parent-${item.label}`,
                        icon: <Icon icon={item.icon} className="text-xl" />,
                        label: hasHref ? (
                            <span
                                onClick={() => handleNavigation(item.href!)}
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <span className="flex items-center gap-3">{item.label}</span>
                        ),
                        children: item.children!.map((child) => ({
                            key: child.href || `child-${child.label}`,
                            icon: <Icon icon={child.icon} className="text-lg" />,
                            label: (
                                <span
                                    onClick={() => child.href && handleNavigation(child.href)}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    {child.label}
                                </span>
                            ),
                        })),
                    };
                }

                return {
                    key: item.href || `item-${item.label}`,
                    icon: <Icon icon={item.icon} className="text-xl" />,
                    label: collapsed ? (
                        <span
                            title={item.label}
                            onClick={() => (hasHref ? handleNavigation(item.href!) : undefined)}
                            className={`flex items-center justify-center w-full ${
                                hasHref ? 'cursor-pointer' : 'cursor-default'
                            }`}
                        >
                            {item.label}
                        </span>
                    ) : (
                        <span
                            onClick={() => (hasHref ? handleNavigation(item.href!) : undefined)}
                            className={`flex items-center gap-3 ${
                                hasHref ? 'cursor-pointer' : 'cursor-default'
                            }`}
                        >
                            {item.label}
                        </span>
                    ),
                };
            }),
        [collapsed, handleNavigation, isAdmin],
    );

    const menuItemsDesktop = useMemo(
        () =>
            SIDEBAR_ITEMS.filter((item) => !(item.checkAdmin && !isAdmin)).map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const hasHref = item.href !== undefined;
                const isOpen = openKeys.includes(item.href || `parent-${item.label}`);

                if (collapsed && hasChildren) {
                    return (
                        <li key={item.href || `parent-${item.label}`}>
                            <Tooltip
                                title={
                                    <div className="py-3 px-2 min-w-[200px]">
                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                                            <Icon
                                                icon={item.icon}
                                                className="text-base text-blue-300"
                                            />
                                            <span className="font-semibold text-white text-sm">
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {item.children!.map((child, index) => (
                                                <div
                                                    key={child.href}
                                                    className={`group flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 transition-all duration-200 ${
                                                        pathname === child.href
                                                            ? 'bg-blue-500/30 text-blue-100 border-l-2 border-blue-400'
                                                            : 'hover:bg-white/15 text-gray-200 hover:text-white'
                                                    }`}
                                                    onClick={() =>
                                                        child.href && handleNavigation(child.href)
                                                    }
                                                >
                                                    <Icon
                                                        icon={child.icon}
                                                        className={`text-sm transition-colors ${
                                                            pathname === child.href
                                                                ? 'text-blue-300'
                                                                : 'text-gray-400 group-hover:text-white'
                                                        }`}
                                                    />
                                                    <span className="text-sm font-medium flex-1">
                                                        {child.label}
                                                    </span>
                                                    {pathname === child.href && (
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                                placement="right"
                                classNames={{
                                    container: 'max-w-xs',
                                }}
                                styles={{
                                    root: {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                    },
                                }}
                                trigger={['hover']}
                                mouseEnterDelay={0.2}
                                mouseLeaveDelay={0.1}
                            >
                                <div className="relative group">
                                    <Button
                                        type="text"
                                        shape="circle"
                                        title={item.label}
                                        onClick={() =>
                                            hasHref ? handleNavigation(item.href!) : undefined
                                        }
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                                            (hasHref && pathname === item.href) ||
                                            item.children!.some((child) => pathname === child.href)
                                                ? 'bg-blue-100 text-blue-600 shadow-lg'
                                                : 'text-foreground-500 hover:bg-gray-100 hover:shadow-md'
                                        }`}
                                    >
                                        <Icon
                                            icon={item.icon}
                                            className="text-xl transition-transform duration-200 group-hover:scale-110"
                                        />
                                    </Button>
                                    {/* Sub menu indicator with count */}
                                    <div
                                        className={`absolute -top-1 -right-1 bg-blue-500 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-600 animate-pulse ${
                                            item.children!.length > 9
                                                ? 'min-w-[20px] h-[20px] px-1'
                                                : 'w-[18px] h-[18px]'
                                        }`}
                                    >
                                        <span
                                            className={`font-bold text-white ${
                                                item.children!.length > 9
                                                    ? 'text-[10px]'
                                                    : 'text-xs'
                                            }`}
                                        >
                                            {item.children!.length > 99
                                                ? '99+'
                                                : item.children!.length}
                                        </span>
                                    </div>
                                    {/* Hover effect ring */}
                                    <div className="absolute inset-0 rounded-xl ring-2 ring-blue-400/30 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"></div>
                                </div>
                            </Tooltip>
                        </li>
                    );
                }

                return (
                    <li key={item.href || `parent-${item.label}`}>
                        <Tooltip title={item.label} placement="right">
                            <Button
                                type="text"
                                shape="circle"
                                title={item.label}
                                onClick={() =>
                                    hasChildren
                                        ? handleSubMenuToggle(item.href || `parent-${item.label}`)
                                        : hasHref
                                          ? handleNavigation(item.href!)
                                          : undefined
                                }
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                                    (hasHref && pathname === item.href) || (hasChildren && isOpen)
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-foreground-500 hover:bg-gray-100'
                                }`}
                            >
                                <Icon icon={item.icon} className="text-xl" />
                            </Button>
                        </Tooltip>

                        {hasChildren && isOpen && !collapsed && (
                            <ul className="mt-2 space-y-1">
                                {item.children!.map((child) => (
                                    <li key={child.href}>
                                        <Tooltip title={child.label} placement="right">
                                            <Button
                                                type="text"
                                                shape="circle"
                                                title={child.label}
                                                onClick={() =>
                                                    child.href && handleNavigation(child.href)
                                                }
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                                                    pathname === child.href
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'text-foreground-500 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Icon icon={child.icon} className="text-lg" />
                                            </Button>
                                        </Tooltip>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                );
            }),
        [isAdmin, pathname, handleNavigation, openKeys, collapsed],
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
                        openKeys={openKeys}
                        onOpenChange={setOpenKeys}
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
                <Menu
                    mode="inline"
                    items={menuItems}
                    selectedKeys={[pathname]}
                    openKeys={openKeys}
                    onOpenChange={setOpenKeys}
                />
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

export default Sidebar;
