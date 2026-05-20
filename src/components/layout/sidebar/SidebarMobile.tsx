import { CustomButton, CustomDrawer } from '@/components/custom';
import { Logo } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Fragment } from 'react/jsx-runtime';

import { SidebarNavItem } from '@/components/layout/sidebar/SidebarNavItem';
import { SidebarProfile } from '@/components/layout/sidebar/SidebarProfile';

type SidebarMobileProps = {
    activeMenu: string;
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    handleMenuClick: (item: SidebarItem) => void;
    isItemActive: (item: SidebarItem) => boolean;
    isMenuExpanded: (item: SidebarItem) => boolean;
};

export const SidebarMobile = ({
    mobileOpen,
    activeMenu,
    setMobileOpen,
    handleMenuClick,
    isItemActive,
    isMenuExpanded,
}: SidebarMobileProps) => {
    return (
        <Fragment key="sidebar-mobile">
            <div
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
                    mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />
            <CustomDrawer
                width={300}
                zIndex={1050}
                closable={false}
                placement="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                className="md:hidden [&_.ant-drawer-body]:!p-0 [&_.ant-drawer-body]:!h-full [&_.ant-drawer-body]:!flex [&_.ant-drawer-body]:!flex-col"
            >
                <div className="flex flex-shrink-0 items-center justify-between border-b border-hub-border">
                    <div className="flex items-center gap-2 h-[32px] px-4">
                        <Logo iconSize="2xl" textSize="lg" />
                    </div>
                    <CustomButton
                        touchFriendly
                        type="text"
                        shape="circle"
                        aria-label="Close sidebar"
                        onClick={() => setMobileOpen(false)}
                        icon={<Icon icon="lucide:x" className="text-lg" />}
                        className="min-h-11 min-w-11 text-hub-muted hover:text-hub-text"
                    />
                </div>

                <nav className="flex-1 py-4 overflow-y-auto px-3 min-h-0">
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

                <div className="flex-shrink-0">
                    <SidebarProfile isCollapsed={false} />
                </div>
            </CustomDrawer>
        </Fragment>
    );
};
