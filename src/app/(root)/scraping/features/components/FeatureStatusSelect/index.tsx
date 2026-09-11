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
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        Trạng thái hiện tại
                    </span>
                ),
                children: [
                    {
                        disabled: true,
                        key: `current-${status}`,
                        className:
                            '!cursor-default !bg-slate-50 dark:!bg-slate-900/60 !rounded-lg !my-1',
                        label: (
                            <CustomFlex
                                gap={12}
                                align="center"
                                justify="space-between"
                                className="py-1 min-w-[280px]"
                            >
                                <CustomFlex align="center" gap={8}>
                                    <CustomFlex
                                        align="center"
                                        justify="center"
                                        className={`w-6 h-6 rounded-md shrink-0 border ${currentConfig?.pillClass}`}
                                    >
                                        <Icon
                                            className="text-xs"
                                            icon={currentConfig?.icon || 'lucide:circle'}
                                        />
                                    </CustomFlex>
                                    <span className="text-xs font-semibold text-hub-title">
                                        {currentConfig?.label}
                                    </span>
                                </CustomFlex>
                                <CustomTag
                                    color="success"
                                    className="text-[10px] m-0 px-1.5 py-0 shrink-0 font-medium"
                                >
                                    Đang áp dụng
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
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                            Chuyển đổi sang trạng thái
                        </span>
                    ),
                    children: availableStatuses.map((targetSt) => {
                        const cfg = DATA_PROVIDER_FEATURE_STATUS_CONFIG[targetSt];
                        return {
                            key: targetSt,
                            onClick: () => handleSelectOption(targetSt),
                            className:
                                '!rounded-lg !my-0.5 hover:!bg-slate-100 dark:hover:!bg-slate-800/80 transition-colors',
                            label: (
                                <CustomFlex
                                    align="flex-start"
                                    gap={10}
                                    className="py-1.5 min-w-[280px]"
                                >
                                    <CustomFlex
                                        align="center"
                                        justify="center"
                                        className={`w-7 h-7 rounded-lg shrink-0 border mt-0.5 ${cfg.pillClass}`}
                                    >
                                        <Icon icon={cfg.icon} className="text-sm" />
                                    </CustomFlex>

                                    <CustomFlex vertical gap={2} className="flex-1 min-w-0">
                                        <CustomFlex align="center" justify="space-between" gap={8}>
                                            <span className="text-xs font-semibold text-hub-title leading-tight">
                                                {cfg.actionLabel || cfg.label}
                                            </span>
                                            {cfg.requiresRunnerTest && (
                                                <CustomTag
                                                    color="processing"
                                                    className="text-[10px] m-0 px-1.5 py-0 leading-normal shrink-0 font-medium"
                                                >
                                                    ⚡ Test
                                                </CustomTag>
                                            )}
                                        </CustomFlex>
                                        <span className="text-[11px] text-hub-subtitle leading-snug">
                                            {cfg.description}
                                        </span>
                                    </CustomFlex>
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
