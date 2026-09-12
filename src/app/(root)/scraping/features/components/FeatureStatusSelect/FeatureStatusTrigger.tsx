'use client';

import { CustomButton, CustomFlex, type CustomButtonProps } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FeatureStatusDefinition } from '../../constants';

export type FeatureStatusTriggerProps = Omit<CustomButtonProps, 'children'> & {
    currentConfig?: FeatureStatusDefinition;
};

export const FeatureStatusTrigger = ({
    loading = false,
    disabled = false,
    className = '',
    currentConfig,
    ...props
}: FeatureStatusTriggerProps) => {
    return (
        <CustomButton
            loading={loading}
            disabled={disabled}
            className={`!h-[40px] px-3.5 rounded-lg border font-medium text-sm transition-all shadow-sm flex items-center justify-center ${currentConfig?.pillClass} ${className}`}
            {...props}
        >
            <CustomFlex align="center" gap={8}>
                <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${currentConfig?.pulseClass}`}
                />
                <span>{currentConfig?.label}</span>
                {!loading && (
                    <Icon icon="lucide:chevron-down" className="text-sm opacity-70 ml-0.5" />
                )}
            </CustomFlex>
        </CustomButton>
    );
};
