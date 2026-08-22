'use client';

import { CustomButton, CustomFlex, CustomTypography } from '@/components/custom-antd';
import type { ReactNode } from 'react';

export type BreadcrumbItem = {
    key?: string;
    href?: string;
    label: ReactNode;
    icon?: ReactNode;
    separator?: ReactNode;
    onClick?: () => void;
};

export type BreadcrumbNavProps = {
    className?: string;
    separator?: ReactNode;
    items?: BreadcrumbItem[];
};

export const BreadcrumbNav = ({
    items = [],
    separator = '/',
    className = '',
}: BreadcrumbNavProps) => {
    if (!items?.length) return null;

    const lastIndex = items.length - 1;

    return (
        <CustomFlex
            wrap
            gap="small"
            align="center"
            component="nav"
            aria-label="Breadcrumb"
            className={`text-sm ${className}`.trim()}
        >
            {items.map((item, index) => {
                const isLast = index === lastIndex;
                const itemSeparator = item.separator || separator;

                return (
                    <CustomFlex key={item.key || index} align="center" gap="small">
                        {index > 0 && (
                            <CustomTypography.Text
                                type="secondary"
                                className="select-none text-hub-subtitle"
                            >
                                {itemSeparator}
                            </CustomTypography.Text>
                        )}

                        {isLast && !item.onClick && !item.href ? (
                            <CustomTypography.Text
                                strong
                                className="text-hub-title truncate max-w-xs sm:max-w-md md:max-w-lg"
                            >
                                {item.label}
                            </CustomTypography.Text>
                        ) : item.onClick || item.href ? (
                            <CustomButton
                                type="text"
                                icon={item.icon}
                                href={item.href}
                                onClick={item.onClick}
                                className="hover:bg-hub-section px-2 py-1 h-auto font-normal text-hub-subtitle hover:text-hub-title flex items-center gap-1.5"
                            >
                                {item.label}
                            </CustomButton>
                        ) : (
                            <CustomTypography.Text type="secondary" className="text-hub-subtitle">
                                {item.label}
                            </CustomTypography.Text>
                        )}
                    </CustomFlex>
                );
            })}
        </CustomFlex>
    );
};
