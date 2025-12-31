'use client';

import { SidebarItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { Button } from 'antd';
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

const SidebarNavItem = ({
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
        <Button
            type="text"
            onClick={() => onItemClick(item)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center justify-between px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden h-auto ${
                isActive && !hasChildren
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                    : isActive && hasChildren
                      ? 'text-indigo-700 bg-slate-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            {isActive && !hasChildren && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-indigo-600 rounded-r-full"></div>
            )}

            <div
                className={`flex items-center gap-3 relative z-10 ${isActive && !hasChildren ? 'pl-2' : ''} ${isCollapsed ? 'md:justify-center md:w-full' : ''} transition-all duration-200`}
            >
                <Icon
                    icon={item.icon}
                    className={`flex-shrink-0 w-5 h-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                <span className={`whitespace-nowrap ${isCollapsed ? 'md:hidden' : 'block'}`}>
                    {item.label}
                </span>
            </div>

            {hasChildren && (
                <Icon
                    icon="lucide:chevron-down"
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-500' : 'text-slate-400'} ${isCollapsed ? 'md:hidden' : 'block'}`}
                />
            )}
        </Button>
    );

    const renderChildrenItems = () => {
        if (!hasChildren || !isExpanded) return null;

        return (
            <div
                className={`mt-1 space-y-1 pl-2 border-l border-slate-200 ${isCollapsed ? 'md:hidden' : 'ml-4'}`}
            >
                {item.children?.map((child: SidebarItem) => {
                    const isSubActive = activeMenu === child.href;
                    return (
                        <Button
                            type="text"
                            key={child.href || child.label}
                            onClick={() => onSubItemClick(child)}
                            className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 md:py-2 rounded-md text-sm transition-all duration-200 h-auto ${
                                isSubActive
                                    ? 'text-indigo-600 bg-indigo-50 font-medium'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Icon
                                icon={child.icon}
                                className={`flex-shrink-0 w-4 h-4 transition-colors duration-200 ${
                                    isSubActive ? 'text-indigo-600' : 'text-slate-400'
                                }`}
                            />
                            <span className="truncate">{child.label}</span>
                        </Button>
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

export default SidebarNavItem;
