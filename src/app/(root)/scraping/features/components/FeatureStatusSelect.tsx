'use client';

import { CustomFlex, CustomSelect } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { DATA_PROVIDER_FEATURE_STATUS_CONFIG, SELECTABLE_FEATURE_STATUSES } from '../constants';
import { DataProviderFeatureStatus } from '../enums';

export interface FeatureStatusSelectProps {
    status: DataProviderFeatureStatus;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    onChange: (nextStatus: DataProviderFeatureStatus) => void;
}

export const FeatureStatusSelect = ({
    status,
    loading = false,
    disabled = false,
    className = '',
    onChange,
}: FeatureStatusSelectProps) => {
    const isUnconfigured = status === DataProviderFeatureStatus.UNCONFIGURED;
    const isDisabled = disabled || loading || isUnconfigured;

    const options = useMemo(() => {
        const list = SELECTABLE_FEATURE_STATUSES.map((itemStatus) => {
            const config = DATA_PROVIDER_FEATURE_STATUS_CONFIG[itemStatus];
            return {
                value: itemStatus,
                label: (
                    <CustomFlex align="center" gap={8} className="py-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotClass}`} />
                        <span className="text-xs font-medium">{config.label}</span>
                    </CustomFlex>
                ),
            };
        });

        if (status === DataProviderFeatureStatus.ERROR) {
            const errConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.ERROR];
            list.unshift({
                value: DataProviderFeatureStatus.ERROR,
                label: (
                    <CustomFlex align="center" gap={8} className="py-0.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${errConfig.dotClass}`} />
                        <span className="text-xs font-medium text-rose-500">{errConfig.label}</span>
                    </CustomFlex>
                ),
            });
        }

        if (isUnconfigured) {
            const unconfConfig =
                DATA_PROVIDER_FEATURE_STATUS_CONFIG[DataProviderFeatureStatus.UNCONFIGURED];
            return [
                {
                    value: DataProviderFeatureStatus.UNCONFIGURED,
                    label: (
                        <CustomFlex align="center" gap={8} className="py-0.5">
                            <span
                                className={`w-2 h-2 rounded-full shrink-0 ${unconfConfig.dotClass}`}
                            />
                            <span className="text-xs font-medium">{unconfConfig.label}</span>
                        </CustomFlex>
                    ),
                },
            ];
        }

        return list;
    }, [status, isUnconfigured]);

    return (
        <CustomSelect
            size="small"
            value={status}
            loading={loading}
            options={options}
            disabled={isDisabled}
            popupMatchSelectWidth={false}
            className={`min-w-[150px] font-medium text-xs ${className}`}
            onChange={(val) => onChange(val as DataProviderFeatureStatus)}
            suffixIcon={
                loading ? undefined : (
                    <Icon icon="lucide:chevron-down" className="text-xs text-hub-subtitle" />
                )
            }
        />
    );
};
