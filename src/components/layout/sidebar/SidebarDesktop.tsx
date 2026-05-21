import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';

import { SidebarNavItem } from '@/components/layout/sidebar/SidebarNavItem';
import { SidebarLogo } from '@/components/layout/sidebar/SidebarLogo';
import { SidebarProfile } from '@/components/layout/sidebar/SidebarProfile';

type SidebarDesktopProps = {
    collapsed: boolean;
    handleLogoClick: () => void;
    handleMenuClick: (item: SidebarItem) => void;
    isItemActive: (item: SidebarItem) => boolean;
};

export const SidebarDesktop = ({
    collapsed,
    handleLogoClick,
    handleMenuClick,
    isItemActive,
}: SidebarDesktopProps) => {
    return (
        <aside
            key="sidebar-desktop"
            data-hub-shell="sidebar"
            className="flex h-full w-full flex-col overflow-hidden rounded-hub-shell border border-hub-border bg-hub-surface shadow-sm"
        >
            <div
                className={`flex h-16 shrink-0 items-center justify-center border-b border-hub-border ${
                    collapsed ? 'px-2' : 'px-4'
                }`}
            >
                <div
                    onClick={handleLogoClick}
                    className={`flex items-center ${collapsed ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                    <SidebarLogo compact={collapsed} />
                </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-4 md:px-3">
                <div className="space-y-1.5">
                    {SIDEBAR_ITEMS.map((item) => (
                        <SidebarNavItem
                            key={item.href || item.label}
                            item={item}
                            isCollapsed={collapsed}
                            isActive={isItemActive(item)}
                            onItemClick={handleMenuClick}
                        />
                    ))}
                </div>
            </nav>

            <SidebarProfile isCollapsed={collapsed} />
        </aside>
    );
};
