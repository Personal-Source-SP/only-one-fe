'use client';

import { ReactNode } from 'react';
import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type ConfigGroupContainerProps = {
    title: string;
    icon?: string;
    badge?: string;
    badgeColor?: string;
    children: ReactNode;
    description?: string;
};

export const ConfigGroupContainer = ({
    title,
    icon,
    badge,
    badgeColor = 'processing',
    children,
    description,
}: ConfigGroupContainerProps) => {
    return (
        <div className="rounded-xl bg-hub-section/10 p-3.5 sm:p-4 space-y-3.5">
            <CustomFlex
                align="center"
                justify="space-between"
                className="pb-2 border-b border-hub-border/40"
            >
                <CustomFlex align="center" gap="small">
                    {icon && <Icon icon={icon} className="text-hub-primary text-base shrink-0" />}
                    <CustomFlex vertical gap={2}>
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            {title}
                        </CustomTypography.Text>
                        {description && (
                            <CustomTypography.Text className="text-xs text-hub-subtitle">
                                {description}
                            </CustomTypography.Text>
                        )}
                    </CustomFlex>
                </CustomFlex>
                {badge && (
                    <CustomTag
                        color={badgeColor}
                        className="m-0 text-xs px-2 py-0.5 font-medium rounded-full"
                    >
                        {badge}
                    </CustomTag>
                )}
            </CustomFlex>
            <CustomFlex vertical gap="middle">
                {children}
            </CustomFlex>
        </div>
    );
};
