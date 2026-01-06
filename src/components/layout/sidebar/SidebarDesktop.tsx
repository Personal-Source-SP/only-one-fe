import { Logo } from '@/components/common';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constant';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button, Popover } from 'antd';

import SidebarNavItem from '@/components/layout/sidebar/SidebarNavItem';
import SidebarPopoverContent from '@/components/layout/sidebar/SidebarPopoverContent';
import SidebarProfile from '@/components/layout/sidebar/SidebarProfile';

type SidebarDesktopProps = {
    collapsed: boolean;
    activeMenu: string;
    handleLogoClick: () => void;
    handleToggleCollapse: () => void;
    handleMenuClick: (item: SidebarItem) => void;
    isItemActive: (item: SidebarItem) => boolean;
    isMenuExpanded: (item: SidebarItem) => boolean;
};

const SidebarDesktop = ({
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
                    {SIDEBAR_ITEMS.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;

                        if (collapsed && hasChildren) {
                            return (
                                <Popover
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
                                </Popover>
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

export default SidebarDesktop;
