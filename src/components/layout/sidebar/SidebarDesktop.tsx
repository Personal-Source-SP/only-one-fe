import { CustomButton, CustomPopover } from '@/components/custom';
import { SIDEBAR_ITEMS } from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';

import { SidebarNavItem } from '@/components/layout/sidebar/SidebarNavItem';
import { SidebarLogo } from '@/components/layout/sidebar/SidebarLogo';
import { SidebarPopoverContent } from '@/components/layout/sidebar/SidebarPopoverContent';
import { SidebarProfile } from '@/components/layout/sidebar/SidebarProfile';

type SidebarDesktopProps = {
    collapsed: boolean;
    activeMenu: string;
    handleLogoClick: () => void;
    handleToggleCollapse: () => void;
    handleMenuClick: (item: SidebarItem) => void;
    isItemActive: (item: SidebarItem) => boolean;
    isMenuExpanded: (item: SidebarItem) => boolean;
};

export const SidebarDesktop = ({
    collapsed,
    activeMenu,
    handleLogoClick,
    handleToggleCollapse,
    handleMenuClick,
    isItemActive,
    isMenuExpanded,
}: SidebarDesktopProps) => {
    return (
        <aside
            key="sidebar-desktop"
            className={`hidden border-r border-hub-border bg-hub-surface transition-all duration-300 md:fixed md:inset-y-0 md:flex md:flex-col ${
                collapsed ? 'md:w-16' : 'md:w-64'
            }`}
        >
            <div
                className={`flex h-16 items-center border-b border-hub-border ${
                    collapsed ? 'justify-center px-2' : 'relative justify-center px-4'
                }`}
            >
                <div
                    onClick={handleLogoClick}
                    className={`flex items-center ${collapsed ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                    <SidebarLogo compact={collapsed} />
                </div>
                {!collapsed && (
                    <CustomButton
                        type="text"
                        title="Collapse sidebar"
                        onClick={handleToggleCollapse}
                        icon={<Icon icon="lucide:panel-left-close" className="w-5 h-5" />}
                        className="absolute right-4 flex items-center justify-center rounded-lg p-1.5 text-hub-muted transition-all duration-200 hover:bg-hub-bg hover:text-hub-text"
                    />
                )}
            </div>

            <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden px-3">
                <div className="space-y-1.5">
                    {SIDEBAR_ITEMS.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;

                        if (collapsed && hasChildren) {
                            return (
                                <CustomPopover
                                    trigger="hover"
                                    placement="right"
                                    key={item.href || item.label}
                                    classNames={{ root: 'sidebar-desktop-popover' }}
                                    content={
                                        <SidebarPopoverContent
                                            item={item}
                                            activeMenu={activeMenu}
                                            handleMenuClick={handleMenuClick}
                                        />
                                    }
                                >
                                    <div>
                                        <SidebarNavItem
                                            item={item}
                                            isCollapsed={collapsed}
                                            activeMenu={activeMenu}
                                            key={item.href || item.label}
                                            isActive={isItemActive(item)}
                                            isExpanded={isMenuExpanded(item)}
                                            onItemClick={handleMenuClick}
                                            onSubItemClick={handleMenuClick}
                                        />
                                    </div>
                                </CustomPopover>
                            );
                        }

                        return (
                            <SidebarNavItem
                                item={item}
                                isCollapsed={collapsed}
                                activeMenu={activeMenu}
                                key={item.href || item.label}
                                isActive={isItemActive(item)}
                                isExpanded={isMenuExpanded(item)}
                                onItemClick={handleMenuClick}
                                onSubItemClick={handleMenuClick}
                            />
                        );
                    })}
                </div>
            </nav>

            <SidebarProfile isCollapsed={collapsed} />
        </aside>
    );
};
