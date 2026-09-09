'use client';

import { CustomFlex, CustomTypography } from '@/components/custom-antd';
import type { ReactNode } from 'react';

interface SessionMetricCardProps {
    title: ReactNode;
    icon: ReactNode;
    children: ReactNode;
}

export const SessionMetricCard = ({ title, icon, children }: SessionMetricCardProps) => {
    return (
        <CustomFlex
            vertical
            justify="space-between"
            className="h-full rounded-xl border border-hub-border/60 bg-hub-background/50 p-4 transition-all hover:border-hub-primary/40 hover:bg-hub-background"
        >
            <CustomFlex align="center" justify="space-between" className="mb-2">
                <CustomTypography.Text className="text-xs font-medium text-hub-subtitle">
                    {title}
                </CustomTypography.Text>
                {icon}
            </CustomFlex>
            {children}
        </CustomFlex>
    );
};
