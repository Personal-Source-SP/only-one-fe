import { CustomButton, CustomDrawer } from '@/components/custom-antd';
import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Fragment } from 'react/jsx-runtime';

import { SidebarLogo } from './SidebarLogo';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarProfile } from './SidebarProfile';

type SidebarMobileProps = {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    handleMenuClick: (item: SidebarItem) => void;
    isItemActive: (item: SidebarItem) => boolean;
};

export const SidebarMobile = ({
    mobileOpen,
    setMobileOpen,
    handleMenuClick,
    isItemActive,
}: SidebarMobileProps) => {
    return (
        <Fragment key="sidebar-mobile">
            <div
                aria-hidden="true"
                onClick={() => setMobileOpen(false)}
                className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                    mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />
            <CustomDrawer
                width={300}
                zIndex={1050}
                closable={false}
                placement="left"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                className="md:hidden [&_.ant-drawer-body]:!flex [&_.ant-drawer-body]:!h-full [&_.ant-drawer-body]:!flex-col [&_.ant-drawer-body]:!p-0"
            >
                <div className="flex shrink-0 items-center justify-between border-b border-hub-border">
                    <div className="flex h-16 items-center px-4">
                        <SidebarLogo />
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

                <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1.5">
                        {SIDEBAR_ITEMS.map((item) => (
                            <SidebarNavItem
                                key={item.href || item.label}
                                item={item}
                                isCollapsed={false}
                                isActive={isItemActive(item)}
                                onItemClick={handleMenuClick}
                            />
                        ))}
                    </div>
                </nav>

                <div className="shrink-0">
                    <SidebarProfile isCollapsed={false} />
                </div>
            </CustomDrawer>
        </Fragment>
    );
};
