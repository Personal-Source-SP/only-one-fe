'use client';

import { useMemo, type ReactNode } from 'react';
import { CustomFlex, CustomTooltip, CustomTypography } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useFeatureCardContext } from '../../context';
import { DataProviderFeatureStatus } from '../../enums';

interface MetricItem {
    key: string;
    label: string;
    value: string;
    icon?: string;
    strong?: boolean;
    tooltip?: string;
    iconClass?: string;
    valueClass?: string;
    headerRight?: ReactNode;
}

export const FeatureHealthMetrics = () => {
    const { isError, feature } = useFeatureCardContext();

    const { items, lastErrorMessage } = useMemo(() => {
        const count = feature.consecutiveFailures || 0;
        const failureFlag = count > 0 || isError;

        let statusConfig = {
            label: 'Chưa cấu hình',
            icon: 'lucide:settings-2',
            colorClass: 'text-slate-400 dark:text-slate-500',
            bgClass: 'bg-slate-500/10 border-slate-500/20',
            dotClass: 'bg-slate-400',
        };

        switch (feature.status) {
            case DataProviderFeatureStatus.READY:
                statusConfig = {
                    label: 'Hoạt động tốt',
                    icon: 'lucide:activity',
                    colorClass: 'text-emerald-500 dark:text-emerald-400',
                    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
                    dotClass: 'bg-emerald-500 animate-pulse',
                };
                break;
            case DataProviderFeatureStatus.TESTING:
                statusConfig = {
                    label: 'Đang kiểm thử',
                    icon: 'lucide:flask-conical',
                    colorClass: 'text-amber-500 dark:text-amber-400',
                    bgClass: 'bg-amber-500/10 border-amber-500/20',
                    dotClass: 'bg-amber-500',
                };
                break;
            case DataProviderFeatureStatus.ERROR:
                statusConfig = {
                    label: 'Gặp sự cố',
                    icon: 'lucide:alert-triangle',
                    colorClass: 'text-rose-500 dark:text-rose-400',
                    bgClass: 'bg-rose-500/10 border-rose-500/20',
                    dotClass: 'bg-rose-500',
                };
                break;
            case DataProviderFeatureStatus.DISABLED:
                statusConfig = {
                    label: 'Đang tạm dừng',
                    icon: 'lucide:pause-circle',
                    colorClass: 'text-slate-400 dark:text-slate-500',
                    bgClass: 'bg-slate-500/10 border-slate-500/20',
                    dotClass: 'bg-slate-400',
                };
                break;
            case DataProviderFeatureStatus.UNCONFIGURED:
            default:
                break;
        }

        const successDateStr = feature.lastSuccessfulRunAt
            ? formatDate(feature.lastSuccessfulRunAt)
            : 'Chưa chạy';

        const failedDateStr = feature.lastFailedRunAt
            ? formatDate(feature.lastFailedRunAt)
            : 'Chưa có lỗi';

        const metricItems: MetricItem[] = [
            {
                key: 'status',
                label: 'Tình trạng',
                value: statusConfig.label,
                icon: statusConfig.icon,
                iconClass: statusConfig.colorClass,
                valueClass: statusConfig.colorClass,
                strong: true,
                headerRight: <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />,
            },
            {
                key: 'failures',
                label: 'Lỗi liên tiếp',
                value: failureFlag ? `${count} lần lỗi` : '0 (Ổn định)',
                valueClass: failureFlag
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400',
                strong: true,
                headerRight: (
                    <Icon
                        icon={failureFlag ? 'lucide:shield-alert' : 'lucide:shield-check'}
                        className={`w-3.5 h-3.5 ${
                            failureFlag
                                ? 'text-rose-500'
                                : 'text-emerald-500/80 dark:text-emerald-400/80'
                        }`}
                    />
                ),
            },
            {
                key: 'lastSuccess',
                label: 'Chạy OK cuối',
                value: successDateStr,
                valueClass: 'text-hub-title',
                tooltip: successDateStr,
                headerRight: (
                    <Icon
                        icon="lucide:check-circle-2"
                        className="w-3.5 h-3.5 text-emerald-500/80 dark:text-emerald-400/80"
                    />
                ),
            },
            {
                key: 'lastFailed',
                label: 'Chạy lỗi cuối',
                value: failedDateStr,
                valueClass: feature.lastFailedRunAt
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-hub-title',
                tooltip: failedDateStr,
                headerRight: (
                    <Icon
                        icon="lucide:x-circle"
                        className={`w-3.5 h-3.5 ${
                            feature.lastFailedRunAt ? 'text-rose-500' : 'text-slate-400'
                        }`}
                    />
                ),
            },
        ];

        return {
            items: metricItems,
            lastErrorMessage: feature.lastErrorMessage,
        };
    }, [
        isError,
        feature.status,
        feature.consecutiveFailures,
        feature.lastSuccessfulRunAt,
        feature.lastFailedRunAt,
        feature.lastErrorMessage,
    ]);

    return (
        <div className="w-full my-3">
            {/* 2x2 Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                    const content = (
                        <CustomFlex align="center" gap={5}>
                            {item.icon && (
                                <Icon
                                    icon={item.icon}
                                    className={`w-3.5 h-3.5 shrink-0 ${item.iconClass || ''}`}
                                />
                            )}
                            <CustomTypography.Text
                                strong={item.strong}
                                className={`text-xs truncate block ${item.valueClass || ''}`}
                            >
                                {item.value}
                            </CustomTypography.Text>
                        </CustomFlex>
                    );

                    return (
                        <div
                            key={item.key}
                            className="p-2.5 rounded-xl bg-hub-surface border border-hub-border/50 flex flex-col justify-between transition-colors hover:border-hub-border"
                        >
                            <CustomFlex align="center" justify="space-between" className="mb-1">
                                <CustomTypography.Text
                                    type="secondary"
                                    className="text-[11px] text-hub-subtitle font-medium"
                                >
                                    {item.label}
                                </CustomTypography.Text>
                                {item.headerRight}
                            </CustomFlex>

                            {item.tooltip ? (
                                <CustomTooltip title={item.tooltip}>{content}</CustomTooltip>
                            ) : (
                                content
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Error Message Callout */}
            {lastErrorMessage && (
                <CustomFlex
                    gap="small"
                    align="flex-start"
                    className="mt-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-2.5 text-xs shadow-xs"
                >
                    <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <span className="font-semibold block text-[11px] text-rose-700 dark:text-rose-300 mb-0.5">
                            Chi tiết lỗi gần nhất:
                        </span>
                        <CustomTooltip title={lastErrorMessage}>
                            <CustomTypography.Text
                                type="danger"
                                className="text-xs line-clamp-2 !text-rose-600 dark:!text-rose-400 font-mono text-[11px] leading-relaxed"
                            >
                                {lastErrorMessage}
                            </CustomTypography.Text>
                        </CustomTooltip>
                    </div>
                </CustomFlex>
            )}
        </div>
    );
};
