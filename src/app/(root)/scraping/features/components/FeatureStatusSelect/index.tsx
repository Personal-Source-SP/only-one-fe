'use client';

import { CustomDropdown, CustomFlex, CustomTag, type MenuProps } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useCallback, useMemo } from 'react';
import { DATA_PROVIDER_FEATURE_STATUS_CONFIG, getAvailableTargetStatuses } from '../../constants';
import { DataProviderFeatureStatus } from '../../enums';
import { FeatureStatusTrigger } from './FeatureStatusTrigger';
import { FeatureStatusUnconfiguredTrigger } from './FeatureStatusUnconfiguredTrigger';

export type FeatureStatusSelectProps = {
    status: DataProviderFeatureStatus;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    onChange: (nextStatus: DataProviderFeatureStatus) => void | Promise<void>;
};

export const FeatureStatusSelect = ({
    status,
    loading = false,
    disabled = false,
    className = '',
    onChange,
}: FeatureStatusSelectProps) => {
    const isUnconfigured = status === DataProviderFeatureStatus.UNCONFIGURED;
    const isDisabled = disabled || loading || isUnconfigured;
    const currentConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[status];

    const handleSelectOption = useCallback(
        (targetStatus: DataProviderFeatureStatus) => {
            if (targetStatus === status) return;
            onChange(targetStatus);
        },
        [status, onChange],
    );

    const handleMenuClick: MenuProps['onClick'] = useCallback(
        ({ key }: { key: string }) => {
            if (key.startsWith('current-') || key.startsWith('header-')) return;
            handleSelectOption(key as DataProviderFeatureStatus);
        },
        [handleSelectOption],
    );

    const availableStatuses = useMemo(() => getAvailableTargetStatuses(status), [status]);

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items: MenuProps['items'] = [
            {
                type: 'group',
                key: 'header-current',
                label: (
                    <span className="text-[11px] font-semibold text-slate-400">
                        TRẠNG THÁI HIỆN TẠI
                    </span>
                ),
                children: [
                    {
                        disabled: true,
                        key: `current-${status}`,
                        label: (
                            <CustomFlex align="center" justify="space-between" className="py-1">
                                <CustomFlex align="center" gap={8}>
                                    <span
                                        className={`w-2 h-2 rounded-full ${currentConfig?.pulseClass}`}
                                    />
                                    <span className="text-xs font-semibold text-hub-title">
                                        {currentConfig?.label}
                                    </span>
                                </CustomFlex>
                                <CustomTag color="success" className="text-[10px] m-0 px-1 py-0">
                                    Đang hoạt động
                                </CustomTag>
                            </CustomFlex>
                        ),
                    },
                ],
            },
        ];

        if (availableStatuses.length > 0) {
            items.push(
                {
                    type: 'divider',
                },
                {
                    type: 'group',
                    key: 'header-transitions',
                    label: (
                        <span className="text-[11px] font-semibold text-slate-400">
                            CHUYỂN ĐỔI TRẠNG THÁI
                        </span>
                    ),
                    children: availableStatuses.map((targetSt) => {
                        const cfg = DATA_PROVIDER_FEATURE_STATUS_CONFIG[targetSt];
                        return {
                            key: targetSt,
                            onClick: () => handleSelectOption(targetSt),
                            label: (
                                <CustomFlex vertical gap={2} className="py-1 min-w-[200px]">
                                    <CustomFlex align="center" justify="space-between" gap={8}>
                                        <CustomFlex align="center" gap={8}>
                                            <Icon icon={cfg.icon} className="text-sm" />
                                            <span className="text-xs font-medium text-hub-title">
                                                {cfg.actionLabel || cfg.label}
                                            </span>
                                        </CustomFlex>
                                        {cfg.requiresRunnerTest && (
                                            <CustomTag
                                                color="processing"
                                                className="text-[10px] m-0 px-1 py-0"
                                            >
                                                ⚡ Test
                                            </CustomTag>
                                        )}
                                    </CustomFlex>
                                    <span className="text-[11px] text-hub-subtitle pl-6">
                                        {cfg.description}
                                    </span>
                                </CustomFlex>
                            ),
                        };
                    }),
                },
            );
        }

        return items;
    }, [status, currentConfig, availableStatuses, handleSelectOption]);

    if (isUnconfigured) {
        return (
            <FeatureStatusUnconfiguredTrigger currentConfig={currentConfig} className={className} />
        );
    }

    return (
        <CustomDropdown
            trigger={['click']}
            disabled={isDisabled}
            placement="bottomRight"
            menu={{ items: menuItems, onClick: handleMenuClick }}
        >
            <FeatureStatusTrigger
                loading={loading}
                className={className}
                disabled={isDisabled}
                currentConfig={currentConfig}
            />
        </CustomDropdown>
    );
};
