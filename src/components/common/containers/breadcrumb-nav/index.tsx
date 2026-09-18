'use client';

import { CustomButton, CustomFlex } from '@/components/custom-antd';
import type { IBreadcrumbItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useCallback, useMemo, type ReactNode } from 'react';

export type { IBreadcrumbItem as BreadcrumbItem };

export type BreadcrumbNavProps = {
    className?: string;
    separator?: ReactNode;
    items?: IBreadcrumbItem[];
};

export const BreadcrumbNav = ({ items = [], separator, className = '' }: BreadcrumbNavProps) => {
    if (!items?.length) return null;

    const lastIndex = useMemo(() => items.length - 1, [items.length]);

    const defaultSeparator = useMemo(
        () => (
            <Icon
                icon="lucide:chevron-right"
                className="text-hub-subtitle/50 text-xs shrink-0 mx-0.5"
            />
        ),
        [],
    );

    const renderItemContent = useCallback(
        (item: IBreadcrumbItem, isLast: boolean, itemIcon: ReactNode) => {
            if (isLast && !item.onClick && !item.href) {
                return (
                    <CustomFlex
                        gap={6}
                        align="center"
                        className="px-2.5 py-1 rounded-lg bg-hub-primary/10 text-hub-primary font-semibold text-xs md:text-sm border border-hub-primary/20"
                    >
                        {itemIcon}
                        <span className="truncate max-w-xs sm:max-w-md md:max-w-lg">
                            {item.label}
                        </span>
                    </CustomFlex>
                );
            }

            if (item.onClick || item.href) {
                return (
                    <CustomButton
                        type="text"
                        icon={itemIcon}
                        href={item.href}
                        onClick={item.onClick}
                        className="hover:bg-hub-primary/10 hover:text-hub-primary text-hub-subtitle font-medium px-2.5 py-1 h-auto text-xs md:text-sm rounded-lg transition-all duration-150 flex items-center gap-1.5"
                    >
                        {item.label}
                    </CustomButton>
                );
            }

            return (
                <CustomFlex
                    gap={6}
                    align="center"
                    className="text-hub-subtitle font-medium text-xs md:text-sm px-1.5 py-1"
                >
                    {itemIcon}
                    <span>{item.label}</span>
                </CustomFlex>
            );
        },
        [],
    );

    const renderItemBreadcrumb = useCallback(
        (item: IBreadcrumbItem, index: number) => {
            const isLast = index === lastIndex;
            const itemSeparator = item.separator || separator || defaultSeparator;
            const itemIcon =
                item.icon ||
                (item.iconName ? <Icon icon={item.iconName} className="text-sm shrink-0" /> : null);

            return (
                <CustomFlex key={item.key || index} align="center" gap="small">
                    {index > 0 && itemSeparator}
                    {renderItemContent(item, isLast, itemIcon)}
                </CustomFlex>
            );
        },
        [renderItemContent],
    );

    return (
        <CustomFlex
            wrap
            gap="small"
            align="center"
            component="nav"
            aria-label="Breadcrumb"
            className={`text-sm select-none ${className}`.trim()}
        >
            {items.map(renderItemBreadcrumb)}
        </CustomFlex>
    );
};
