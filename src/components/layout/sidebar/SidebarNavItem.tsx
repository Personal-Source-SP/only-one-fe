'use client';

import { CustomButton } from '@/components/custom';
import {
    SIDEBAR_NAV_ACTIVE_CLASS_NAME,
    SIDEBAR_NAV_ACTIVE_INDICATOR_CLASS_NAME,
    SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME,
    SIDEBAR_NAV_SUB_ACTIVE_CLASS_NAME,
} from '@/constants';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Fragment } from 'react';

type SidebarNavItemProps = {
    item: SidebarItem;
    isActive: boolean;
    activeMenu: string;
    isExpanded: boolean;
    isCollapsed: boolean;
    onItemClick: (item: SidebarItem) => void;
    onSubItemClick: (item: SidebarItem) => void;
};

export const SidebarNavItem = ({
    item,
    isActive,
    isExpanded,
    isCollapsed,
    activeMenu,
    onItemClick,
    onSubItemClick,
}: SidebarNavItemProps) => {
    const hasChildren = item.children && item.children.length > 0;

    const renderParentItem = () => (
        <CustomButton
            type="text"
            onClick={() => onItemClick(item)}
            title={isCollapsed ? item.label : ''}
            className={`group relative flex h-auto w-full items-center justify-between overflow-hidden rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 md:py-2.5 ${
                isActive && !hasChildren
                    ? SIDEBAR_NAV_ACTIVE_CLASS_NAME
                    : isActive && hasChildren
                      ? 'bg-hub-bg text-hub-primary'
                      : 'text-hub-muted hover:bg-hub-bg hover:text-hub-text'
            }`}
        >
            {isActive && !hasChildren && (
                <span className={SIDEBAR_NAV_ACTIVE_INDICATOR_CLASS_NAME} aria-hidden />
            )}

            <div
                className={`relative z-10 flex items-center gap-3 transition-all duration-200 ${isActive && !hasChildren ? 'pl-2' : ''} ${isCollapsed ? 'md:w-full md:justify-center' : ''}`}
            >
                <Icon
                    icon={item.icon}
                    className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME : 'text-hub-muted group-hover:text-hub-text'}`}
                />
                <span className={`whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>
                    {item.label}
                </span>
            </div>

            {hasChildren && (
                <Icon
                    icon="lucide:chevron-down"
                    className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-hub-primary' : 'text-hub-muted'} ${isCollapsed ? 'md:hidden' : 'block'}`}
                />
            )}
        </CustomButton>
    );

    const renderChildrenItems = () => {
        if (!hasChildren || !isExpanded) return null;

        return (
            <div
                className={`mt-1 space-y-1 border-l border-hub-border pl-2 ${isCollapsed ? 'md:hidden' : 'ml-4'}`}
            >
                {item.children?.map((child: SidebarItem) => {
                    const isSubActive = activeMenu === child.href;
                    return (
                        <CustomButton
                            type="text"
                            key={child.href || child.label}
                            onClick={() => onSubItemClick(child)}
                            className={`flex h-auto w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 md:py-2 ${
                                isSubActive
                                    ? SIDEBAR_NAV_SUB_ACTIVE_CLASS_NAME
                                    : 'text-hub-muted hover:bg-hub-bg hover:text-hub-text'
                            }`}
                        >
                            <Icon
                                icon={child.icon}
                                className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
                                    isSubActive
                                        ? SIDEBAR_NAV_ICON_ACTIVE_CLASS_NAME
                                        : 'text-hub-muted'
                                }`}
                            />
                            <span className="truncate">{child.label}</span>
                        </CustomButton>
                    );
                })}
            </div>
        );
    };

    return (
        <Fragment key={item.href || item.label}>
            {renderParentItem()}
            {renderChildrenItems()}
        </Fragment>
    );
};
