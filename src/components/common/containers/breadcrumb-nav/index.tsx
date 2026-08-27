'use client';

import { CustomButton, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';

export type BreadcrumbItem = {
    key?: string;
    href?: string;
    label: ReactNode;
    icon?: ReactNode;
    iconName?: string;
    separator?: ReactNode;
    onClick?: () => void;
};

export type BreadcrumbNavProps = {
    className?: string;
    separator?: ReactNode;
    items?: BreadcrumbItem[];
};

export const BreadcrumbNav = ({ items = [], separator, className = '' }: BreadcrumbNavProps) => {
    if (!items?.length) return null;

    const lastIndex = items.length - 1;
    const defaultSeparator = (
        <Icon
            icon="lucide:chevron-right"
            className="text-hub-subtitle/50 text-xs shrink-0 mx-0.5"
        />
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
            {items.map((item, index) => {
                const isLast = index === lastIndex;
                const itemSeparator = item.separator || separator || defaultSeparator;
                const itemIcon =
                    item.icon ||
                    (item.iconName ? (
                        <Icon icon={item.iconName} className="text-sm shrink-0" />
                    ) : null);

                return (
                    <CustomFlex key={item.key || index} align="center" gap="small">
                        {index > 0 && itemSeparator}

                        {isLast && !item.onClick && !item.href ? (
                            <CustomFlex
                                align="center"
                                gap={6}
                                className="px-2.5 py-1 rounded-lg bg-hub-primary/10 text-hub-primary font-semibold text-xs md:text-sm border border-hub-primary/20"
                            >
                                {itemIcon}
                                <span className="truncate max-w-xs sm:max-w-md md:max-w-lg">
                                    {item.label}
                                </span>
                            </CustomFlex>
                        ) : item.onClick || item.href ? (
                            <CustomButton
                                type="text"
                                icon={itemIcon}
                                href={item.href}
                                onClick={item.onClick}
                                className="hover:bg-hub-primary/10 hover:text-hub-primary text-hub-subtitle font-medium px-2.5 py-1 h-auto text-xs md:text-sm rounded-lg transition-all duration-150 flex items-center gap-1.5"
                            >
                                {item.label}
                            </CustomButton>
                        ) : (
                            <CustomFlex
                                align="center"
                                gap={6}
                                className="text-hub-subtitle font-medium text-xs md:text-sm px-1.5 py-1"
                            >
                                {itemIcon}
                                <span>{item.label}</span>
                            </CustomFlex>
                        )}
                    </CustomFlex>
                );
            })}
        </CustomFlex>
    );
};
