'use client';

import { CustomFlex, CustomSwitch, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { DataProviderFeatureStatus } from '../../enums';
import type { FeatureDefinition } from '../../utils';
import type { IDataProviderFeature } from '../../types';

type FeatureCardHeaderProps = {
    isReady: boolean;
    feature: IDataProviderFeature;
    meta?: FeatureDefinition;
    onSwitchStatus: () => void;
};

export const FeatureCardHeader = ({
    isReady,
    feature,
    meta,
    onSwitchStatus,
}: FeatureCardHeaderProps) => {
    const iconName = meta?.icon || 'lucide:cpu';
    const featureTitle = meta?.label || feature.type;
    const featureDescription = meta?.description || '';
    const accentColor = meta?.accentClass || 'text-hub-primary bg-hub-primary/10';

    return (
        <CustomFlex align="flex-start" justify="space-between" gap="middle" className="mb-4">
            <CustomFlex align="center" gap="middle">
                <CustomFlex
                    align="center"
                    justify="center"
                    className={`p-3 rounded-xl shrink-0 ${accentColor}`}
                >
                    <Icon icon={iconName} className="w-6 h-6" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Title
                            level={5}
                            className="!mb-0 text-base !font-bold text-hub-title"
                        >
                            {featureTitle}
                        </CustomTypography.Title>
                        <CustomTag className="font-mono text-xs m-0">
                            {feature.service || 'generic'}
                        </CustomTag>
                    </CustomFlex>
                    <CustomTypography.Paragraph
                        type="secondary"
                        className="!mb-0 text-xs text-hub-subtitle mt-0.5"
                    >
                        {featureDescription}
                    </CustomTypography.Paragraph>
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="small" className="shrink-0">
                <CustomSwitch
                    checked={isReady}
                    checkedChildren="Bật"
                    unCheckedChildren="Tắt"
                    onChange={onSwitchStatus}
                    disabled={feature.status === DataProviderFeatureStatus.UNCONFIGURED}
                />
            </CustomFlex>
        </CustomFlex>
    );
};
