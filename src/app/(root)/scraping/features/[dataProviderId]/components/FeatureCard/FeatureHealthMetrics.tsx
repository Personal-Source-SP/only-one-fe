'use client';

import { useMemo } from 'react';
import { CustomCol, CustomFlex, CustomRow, CustomTypography } from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import type { IDataProviderFeature } from '../../types';

type FeatureHealthMetricsProps = {
    isReady: boolean;
    isError: boolean;
    feature: IDataProviderFeature;
};

export const FeatureHealthMetrics = ({ isReady, isError, feature }: FeatureHealthMetricsProps) => {
    const formattedSuccessDate = useMemo(
        () => (feature.lastSuccessfulRunAt ? formatDate(feature.lastSuccessfulRunAt) : 'Chưa chạy'),
        [feature.lastSuccessfulRunAt],
    );

    const formattedFailedDate = useMemo(
        () => (feature.lastFailedRunAt ? formatDate(feature.lastFailedRunAt) : 'Chưa có lỗi'),
        [feature.lastFailedRunAt],
    );

    const statusDotClass = useMemo(() => {
        if (isReady) return 'bg-emerald-500 animate-pulse';
        if (isError) return 'bg-rose-500';

        return 'bg-slate-400';
    }, [isReady, isError]);

    const failuresText = useMemo(() => {
        if (feature.consecutiveFailures > 0) {
            return `${feature.consecutiveFailures} lỗi`;
        }

        return '0 (Ổn định)';
    }, [feature.consecutiveFailures]);

    return (
        <>
            <CustomRow
                gutter={[12, 12]}
                className="bg-hub-section/30 border border-hub-border/40 rounded-xl p-3.5 my-4 w-full"
            >
                <CustomCol span={12}>
                    <CustomTypography.Text
                        type="secondary"
                        className="text-xs text-hub-subtitle block"
                    >
                        Trạng thái
                    </CustomTypography.Text>
                    <CustomFlex align="center" gap={6} className="mt-1">
                        <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
                        <CustomTypography.Text strong className="text-xs text-hub-title">
                            {feature.status}
                        </CustomTypography.Text>
                    </CustomFlex>
                </CustomCol>

                <CustomCol span={12}>
                    <CustomTypography.Text
                        type="secondary"
                        className="text-xs text-hub-subtitle block"
                    >
                        Số lỗi liên tiếp
                    </CustomTypography.Text>
                    <CustomTypography.Text
                        strong
                        className={`text-xs mt-1 block ${
                            isError ? 'text-rose-500' : 'text-emerald-500'
                        }`}
                    >
                        {failuresText}
                    </CustomTypography.Text>
                </CustomCol>

                <CustomCol span={12}>
                    <CustomTypography.Text
                        type="secondary"
                        className="text-xs text-hub-subtitle block"
                    >
                        Chạy OK cuối
                    </CustomTypography.Text>
                    <CustomTypography.Text className="text-xs font-medium text-hub-title mt-1 block truncate">
                        {formattedSuccessDate}
                    </CustomTypography.Text>
                </CustomCol>

                <CustomCol span={12}>
                    <CustomTypography.Text
                        type="secondary"
                        className="text-xs text-hub-subtitle block"
                    >
                        Chạy lỗi cuối
                    </CustomTypography.Text>
                    <CustomTypography.Text className="text-xs font-medium text-hub-title mt-1 block truncate">
                        {formattedFailedDate}
                    </CustomTypography.Text>
                </CustomCol>
            </CustomRow>

            {feature.lastErrorMessage && (
                <CustomFlex
                    gap="small"
                    align="flex-start"
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-lg p-2.5 mb-4"
                >
                    <Icon icon="lucide:alert-circle" className="w-4 h-4 shrink-0 mt-0.5" />
                    <CustomTypography.Text type="danger" className="text-xs line-clamp-2">
                        {feature.lastErrorMessage}
                    </CustomTypography.Text>
                </CustomFlex>
            )}
        </>
    );
};
