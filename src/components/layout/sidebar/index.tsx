'use client';

import { Logo } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Drawer } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import SidebarNavItem from './SidebarNavItem';
import SidebarProfile from './SidebarProfile';

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileOpen]);

    useEffect(() => {
        const findExpandedMenus = (items: SidebarItem[]): string[] => {
            const expanded: string[] = [];
            items.forEach((item) => {
                if (item.children) {
                    const hasActiveChild = item.children.some((child) => child.href === pathname);
                    if (hasActiveChild) {
                        expanded.push(item.href || item.label);
                    }
                }
            });
            return expanded;
        };
        setExpandedMenus(findExpandedMenus(SIDEBAR_ITEMS));
    }, [pathname]);

    const toggleSubMenu = useCallback(
        (item: SidebarItem) => {
            const menuKey = item.href || item.label;
            if (collapsed && window.innerWidth >= 768) {
                setCollapsed(false);
                setExpandedMenus((prev) => [...prev, menuKey]);
                return;
            }
            setExpandedMenus((prev) =>
                prev.includes(menuKey) ? prev.filter((key) => key !== menuKey) : [...prev, menuKey],
            );
        },
        [collapsed, setCollapsed],
    );

    const handleMenuClick = useCallback(
        (item: SidebarItem) => {
            if (item.children) {
                toggleSubMenu(item);
            } else if (item.href) {
                router.push(item.href);
                if (window.innerWidth < 768) {
                    setMobileOpen(false);
                }
            }
        },
        [router, setMobileOpen, toggleSubMenu],
    );

    const isItemActive = useCallback(
        (item: SidebarItem): boolean => {
            if (item.href === pathname) return true;
            if (item.children) {
                return item.children.some((child) => child.href === pathname);
            }
            return false;
        },
        [pathname],
    );

    const isMenuExpanded = useCallback(
        (item: SidebarItem): boolean => {
            const menuKey = item.href || item.label;
            return expandedMenus.includes(menuKey);
        },
        [expandedMenus],
    );

    const handleToggleCollapse = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    const handleLogoClick = useCallback(() => {
        if (collapsed) {
            setCollapsed(false);
        }
    }, [collapsed, setCollapsed]);

    const activeMenu = useMemo(() => pathname, [pathname]);

    const renderDesktopSidebar = () => (
        <aside
            className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white border-r transition-all duration-300 ${
                collapsed ? 'md:w-16' : 'md:w-64'
            }`}
        >
            <div
                className={`flex items-center h-16 border-b border-divider ${
                    collapsed ? 'justify-center px-2' : 'justify-between px-4'
                }`}
            >
                <div
                    onClick={handleLogoClick}
                    className={`flex items-center ${collapsed ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                    <Logo iconSize="2xl" textSize={collapsed ? 'sm' : 'lg'} showText={!collapsed} />
                </div>
                {!collapsed && (
                    <Button
                        type="text"
                        title="Collapse sidebar"
                        onClick={handleToggleCollapse}
                        icon={<Icon icon="lucide:panel-left-close" className="w-5 h-5" />}
                        className="flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-all duration-200"
                    />
                )}
            </div>

            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden px-3">
                <div className="space-y-1.5">
                    {SIDEBAR_ITEMS.map((item) => (
                        <SidebarNavItem
                            key={item.href || item.label}
                            item={item}
                            isActive={isItemActive(item)}
                            isExpanded={isMenuExpanded(item)}
                            isCollapsed={collapsed}
                            activeMenu={activeMenu}
                            onItemClick={handleMenuClick}
                            onSubItemClick={handleMenuClick}
                        />
                    ))}
                </div>
            </nav>

            <SidebarProfile isCollapsed={collapsed} />
        </aside>
    );

    const renderMobileDrawer = () => (
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

            <nav className="flex-1 py-4 overflow-y-auto px-3">
                <div className="space-y-1.5">
                    {SIDEBAR_ITEMS.map((item) => (
                        <SidebarNavItem
                            key={item.href || item.label}
                            item={item}
                            isActive={isItemActive(item)}
                            isExpanded={isMenuExpanded(item)}
                            isCollapsed={false}
                            activeMenu={activeMenu}
                            onItemClick={handleMenuClick}
                            onSubItemClick={handleMenuClick}
                        />
                    ))}
                </div>
            </nav>

            <SidebarProfile isCollapsed={false} />
        </Drawer>
    );

    const renderMobileOverlay = () => (
        <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
        />
    );

    return (
        <Fragment key="sidebar">
            {renderMobileOverlay()}
            {renderDesktopSidebar()}
            {renderMobileDrawer()}
        </Fragment>
    );
};

export default Sidebar;
