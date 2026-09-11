'use client';

import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FeatureStatusSelect } from '../FeatureStatusSelect';
import { SCRAPER_SERVICE_LABELS } from '../../constants';
import { useFeatureCardContext } from '../../context';
import { DataProviderFeatureStatus } from '../../enums';

export const FeatureCardHeader = () => {
    const { feature, meta, isSwitchingStatus, onSwitchStatus } = useFeatureCardContext();
    const { icon, label, description, accentClass } = meta;

    const serviceLabel = SCRAPER_SERVICE_LABELS[feature.service];
    const disabledSwitch =
        feature.status === DataProviderFeatureStatus.UNCONFIGURED || isSwitchingStatus;

    return (
        <CustomFlex align="flex-start" justify="space-between" gap="middle" className="mb-4">
            <CustomFlex align="center" gap="middle">
                <CustomFlex
                    align="center"
                    justify="center"
                    className={`p-3 rounded-xl shrink-0 ${accentClass}`}
                >
                    <Icon icon={icon} className="w-6 h-6" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Title
                            level={5}
                            className="!mb-0 text-base !font-bold text-hub-title"
                        >
                            {label}
                        </CustomTypography.Title>
                        <CustomTag color="blue" className="font-medium text-xs m-0">
                            {serviceLabel}
                        </CustomTag>
                    </CustomFlex>
                    <CustomTypography.Paragraph
                        type="secondary"
                        className="!mb-0 text-xs text-hub-subtitle mt-0.5"
                    >
                        {description}
                    </CustomTypography.Paragraph>
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="small" className="shrink-0">
                <FeatureStatusSelect
                    status={feature.status}
                    onChange={onSwitchStatus}
                    disabled={disabledSwitch}
                    loading={isSwitchingStatus}
                />
            </CustomFlex>
        </CustomFlex>
    );
};
