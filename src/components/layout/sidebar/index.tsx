'use client';

import { SidebarItem } from '@/interfaces';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo } from 'react';

import { SidebarDesktop } from './SidebarDesktop';
import { SidebarMobile } from './SidebarMobile';

type SidebarProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
};

const resolveItemHref = (item: SidebarItem): string | undefined => {
    if (item.href) {
        return item.href;
    }

    if (item.sectionHref) {
        return item.sectionHref;
    }

    return item.children?.[0]?.href;
};

export const Sidebar = ({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

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

    const handleMenuClick = useCallback(
        (item: SidebarItem) => {
            const href = resolveItemHref(item);

            if (href) {
                router.push(href);
                if (window.innerWidth < 768) {
                    setMobileOpen(false);
                }
            }
        },
        [router, setMobileOpen],
    );

    const isItemActive = useCallback(
        (item: SidebarItem): boolean => {
            if (item.href === pathname) {
                return true;
            }

            if (item.children?.length) {
                return item.children.some(
                    (child) =>
                        child.href === pathname ||
                        (child.href && pathname.startsWith(`${child.href}/`)),
                );
            }

            return false;
        },
        [pathname],
    );

    const handleLogoClick = useCallback(() => {
        if (collapsed) {
            setCollapsed(false);
        }
    }, [collapsed, setCollapsed]);

    const desktopProps = useMemo(
        () => ({
            collapsed,
            handleLogoClick,
            handleMenuClick,
            isItemActive,
        }),
        [collapsed, handleLogoClick, handleMenuClick, isItemActive],
    );

    const mobileProps = useMemo(
        () => ({
            mobileOpen,
            setMobileOpen,
            handleMenuClick,
            isItemActive,
        }),
        [mobileOpen, setMobileOpen, handleMenuClick, isItemActive],
    );

    const sidebarColumnClassName = collapsed ? 'md:w-16' : 'md:w-64';

    return (
        <Fragment key="sidebar">
            <SidebarMobile {...mobileProps} />
            <div
                className={`hidden h-full shrink-0 transition-[width] duration-300 md:flex md:flex-col ${sidebarColumnClassName}`}
            >
                <SidebarDesktop {...desktopProps} />
            </div>
        </Fragment>
    );
};
