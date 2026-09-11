'use client';

import { CustomButton, CustomFlex } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FeatureStatusDefinition } from '../../constants';

export type FeatureStatusTriggerProps = {
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    currentConfig?: FeatureStatusDefinition;
};

export const FeatureStatusTrigger = ({
    loading = false,
    disabled = false,
    className = '',
    currentConfig,
}: FeatureStatusTriggerProps) => {
    return (
        <CustomButton
            size="small"
            loading={loading}
            disabled={disabled}
            className={`h-auto py-1 px-3 rounded-lg border font-medium text-xs transition-all shadow-sm ${currentConfig?.pillClass} ${className}`}
        >
            <CustomFlex align="center" gap={6}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig?.pulseClass}`} />
                <span>{currentConfig?.label}</span>
                {!loading && (
                    <Icon icon="lucide:chevron-down" className="text-xs opacity-70 ml-0.5" />
                )}
            </CustomFlex>
        </CustomButton>
    );
};
