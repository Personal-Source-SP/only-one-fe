'use client';

import { CustomFlex, CustomTooltip } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FeatureStatusDefinition } from '../../constants';

export type FeatureStatusUnconfiguredTriggerProps = {
    className?: string;
    currentConfig?: FeatureStatusDefinition;
};

export const FeatureStatusUnconfiguredTrigger = ({
    className = '',
    currentConfig,
}: FeatureStatusUnconfiguredTriggerProps) => {
    return (
        <CustomTooltip title="Vui lòng hoàn tất và lưu cấu hình tính năng để mở khóa trạng thái">
            <CustomFlex
                gap={8}
                align="center"
                className={`!h-[40px] px-3.5 rounded-lg border text-sm cursor-not-allowed select-none ${currentConfig?.pillClass} ${className}`}
            >
                <Icon
                    className="text-base shrink-0"
                    icon={currentConfig?.icon || 'lucide:settings-2'}
                />
                <span className="font-medium">{currentConfig?.label}</span>
                <Icon icon="lucide:lock" className="text-sm opacity-60 ml-0.5" />
            </CustomFlex>
        </CustomTooltip>
    );
};
