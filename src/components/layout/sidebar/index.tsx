'use client';

import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';

import { SidebarDesktop } from './SidebarDesktop';
import { SidebarMobile } from './SidebarMobile';

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

export const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const activeMenu = useMemo(() => pathname, [pathname]);

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
            if (item.href) {
                router.push(item.href);
                if (window.innerWidth < 768) {
                    setMobileOpen(false);
                }
                return;
            }

            if (item.children?.length) {
                toggleSubMenu(item);
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

    return (
        <Fragment key="sidebar">
            <SidebarMobile
                mobileOpen={mobileOpen}
                activeMenu={activeMenu}
                isItemActive={isItemActive}
                setMobileOpen={setMobileOpen}
                isMenuExpanded={isMenuExpanded}
                handleMenuClick={handleMenuClick}
            />

            <SidebarDesktop
                collapsed={collapsed}
                activeMenu={activeMenu}
                isItemActive={isItemActive}
                isMenuExpanded={isMenuExpanded}
                handleLogoClick={handleLogoClick}
                handleMenuClick={handleMenuClick}
                handleToggleCollapse={handleToggleCollapse}
            />
        </Fragment>
    );
};
