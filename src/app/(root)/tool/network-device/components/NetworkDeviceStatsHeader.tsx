'use client';

import { useMemo } from 'react';

import {
    CustomAlert,
    CustomCard,
    CustomCol,
    CustomRow,
    CustomSpace,
    CustomTypography,
} from '@/components';
import { API_ENDPOINT } from '@/config';
import { useCustomData } from '@/hooks';
import { unwrapApiResponse } from '@/utilities';

import { SCAN_STATUS_ALERT_TYPE_MAP, SCAN_STATUS_CONFIG } from '../constants';
import { NetworkScanStatus } from '../enums';
import type { INetworkDeviceStats, IScanStatusResponse } from '../types';

const { Text, Title } = CustomTypography;

export const NetworkDeviceStatsHeader = () => {
    const { data: scanStatusData } = useCustomData<IScanStatusResponse>({
        method: 'get',
        url: API_ENDPOINT.NETWORK_DEVICES.SCAN_STATUS,
        queryOptions: {
            refetchInterval: (query) => {
                const responseData = query.state.data?.data;
                const unwrapped = unwrapApiResponse<IScanStatusResponse>(responseData);
                const status = unwrapped?.status ?? responseData?.status;
                return status === NetworkScanStatus.SCANNING ? 2500 : false;
            },
        },
    });

    const { data: statsData } = useCustomData<INetworkDeviceStats>({
        url: API_ENDPOINT.NETWORK_DEVICES.STATS,
    });

    const alertConfig = useMemo(() => {
        if (!scanStatusData) return {};

        const { status, devicesDiscoveredCount, startedAt } = scanStatusData;
        const statusCfg = SCAN_STATUS_CONFIG[status] || SCAN_STATUS_CONFIG[NetworkScanStatus.IDLE];

        const title = `Tiến trình quét mạng: ${statusCfg.label}${
            devicesDiscoveredCount > 0 ? ` (Đã phát hiện: ${devicesDiscoveredCount} thiết bị)` : ''
        }`;

        const description = startedAt
            ? `Bắt đầu lúc: ${new Date(startedAt).toLocaleTimeString()}`
            : undefined;

        return {
            title,
            description,
            type: SCAN_STATUS_ALERT_TYPE_MAP[status] || 'info',
            visible: status !== NetworkScanStatus.IDLE,
        };
    }, [scanStatusData]);

    const statCards = useMemo(
        () => [
            {
                key: 'total',
                label: 'Tổng thiết bị',
                value: statsData?.total,
                col: { xs: 12, sm: 8, md: 4, lg: 4 },
                cardClass: '!bg-slate-50 dark:!bg-slate-900 border-slate-200',
                valueClass: '!text-blue-600',
            },
            {
                key: 'online',
                label: 'Đang trực tuyến (Online)',
                value: statsData?.onlineCount,
                col: { xs: 12, sm: 8, md: 5, lg: 5 },
                cardClass: '!bg-emerald-50 dark:!bg-emerald-950/20 border-emerald-200',
                valueClass: '!text-emerald-600',
            },
            {
                key: 'camera',
                label: '📹 Camera IP / ONVIF',
                value: statsData?.cameraCount,
                col: { xs: 12, sm: 8, md: 5, lg: 5 },
                cardClass: '!bg-sky-50 dark:!bg-sky-950/20 border-sky-200',
                valueClass: '!text-sky-600',
            },
            {
                key: 'router',
                label: '📡 Router / AP Wi-Fi',
                value: statsData?.routerCount,
                col: { xs: 12, sm: 8, md: 5, lg: 5 },
                cardClass: '!bg-cyan-50 dark:!bg-cyan-950/20 border-cyan-200',
                valueClass: '!text-cyan-600',
            },
            {
                key: 'iot',
                label: '💡 Smart IoT',
                value: statsData?.iotCount,
                col: { xs: 12, sm: 8, md: 5, lg: 5 },
                cardClass: '!bg-amber-50 dark:!bg-amber-950/20 border-amber-200',
                valueClass: '!text-amber-600',
            },
        ],
        [statsData],
    );

    return (
        <CustomSpace direction="vertical" size="middle" className="w-full">
            {alertConfig.visible && (
                <CustomAlert
                    showIcon
                    type={alertConfig.type}
                    title={alertConfig.title}
                    description={alertConfig.description}
                />
            )}

            <CustomRow gutter={[16, 16]}>
                {statCards.map(({ key, label, value, col, cardClass, valueClass }) => (
                    <CustomCol key={key} {...col}>
                        <CustomCard size="small" className={cardClass}>
                            <Text type="secondary" className="text-xs block mb-1">
                                {label}
                            </Text>
                            <Title level={4} className={`!mb-0 ${valueClass}`}>
                                {value}
                            </Title>
                        </CustomCard>
                    </CustomCol>
                ))}
            </CustomRow>
        </CustomSpace>
    );
};
