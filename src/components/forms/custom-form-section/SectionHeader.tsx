'use client';

import { CustomButton, CustomFlex, CustomTag, CustomTypography } from '@/components';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';

export type SectionHeaderProps = {
    title: ReactNode;
    icon?: string;
    badge?: ReactNode;
    extra?: ReactNode;
    className?: string;
    badgeColor?: string;
    collapsed?: boolean;
    collapsible?: boolean;
    description?: ReactNode;
    onToggleCollapse?: () => void;
};

export const SectionHeader = ({
    title,
    icon,
    badge,
    extra,
    className = '',
    badgeColor = 'blue',
    collapsed = false,
    collapsible = false,
    description,
    onToggleCollapse,
}: SectionHeaderProps) => {
    return (
        <CustomFlex
            wrap="wrap"
            gap="small"
            align="center"
            justify="space-between"
            className={`w-full ${className}`}
        >
            <CustomFlex align="center" gap="middle" className="min-w-0">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-hub-primary/10 text-hub-primary border border-hub-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                        <Icon icon={icon} className="text-base" />
                    </div>
                )}
                <CustomFlex vertical gap={2} className="min-w-0">
                    <CustomTypography.Text
                        strong
                        className="text-sm sm:text-base text-hub-title font-semibold tracking-tight"
                    >
                        {title}
                    </CustomTypography.Text>
                    {description && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                            {description}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="small" className="shrink-0">
                {badge && (
                    <CustomTag
                        color={badgeColor}
                        className="m-0 text-xs font-medium rounded-md px-2 py-0.5"
                    >
                        {badge}
                    </CustomTag>
                )}
                {extra}
                {collapsible && (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={onToggleCollapse}
                        className="text-hub-muted hover:text-hub-title p-1"
                        icon={
                            <Icon
                                icon="lucide:chevron-down"
                                className={`text-base transition-transform duration-200 ${
                                    collapsed ? '-rotate-90' : 'rotate-0'
                                }`}
                            />
                        }
                    />
                )}
            </CustomFlex>
        </CustomFlex>
    );
};
