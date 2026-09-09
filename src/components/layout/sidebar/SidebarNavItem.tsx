'use client';

import { CustomButton } from '@/components/custom-antd';
import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';

type SidebarNavItemProps = {
    item: SidebarItem;
    isActive: boolean;
    isCollapsed: boolean;
    onItemClick: (item: SidebarItem) => void;
};

export const SidebarNavItem = ({
    item,
    isActive,
    isCollapsed,
    onItemClick,
}: SidebarNavItemProps) => {
    return (
        <CustomButton
            block={!isCollapsed}
            type="text"
            title={isCollapsed ? item.label : ''}
            onClick={() => onItemClick(item)}
            className={`group relative !h-auto w-full max-w-full items-center overflow-hidden rounded-lg py-3 text-sm font-medium transition-all duration-200 md:py-2.5 ${
                isCollapsed
                    ? 'sidebar-nav-collapsed justify-center px-2 md:justify-center'
                    : 'justify-start px-3 text-left md:px-3'
            } ${
                isActive
                    ? 'bg-hub-active text-hub-primary font-semibold'
                    : 'text-hub-muted hover:bg-hub-section-muted hover:text-hub-text'
            }`}
        >
            {isActive && !isCollapsed && (
                <span
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-hub-primary"
                    aria-hidden
                />
            )}

            <div
                className={`relative z-10 flex w-full min-w-0 items-center gap-3 transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : 'justify-start'
                } ${isActive && !isCollapsed ? 'pl-2' : ''}`}
            >
                <Icon
                    icon={item.icon}
                    className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-hub-primary' : 'text-hub-muted group-hover:text-hub-text'}`}
                />
                <span className={`whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>
                    {item.label}
                </span>
            </div>
        </CustomButton>
    );
};
