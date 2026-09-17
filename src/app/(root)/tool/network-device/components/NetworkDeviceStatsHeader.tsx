'use client';

import {
    CustomAlert,
    CustomCard,
    CustomCol,
    CustomRow,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import React from 'react';
import { SCAN_STATUS_CONFIG } from '../constants';
import { NetworkScanStatus } from '../enums';
import { IScanStatusResponse } from '../types';

const { Text, Title } = CustomTypography;

type NetworkDeviceStatsHeaderProps = {
    stats: {
        total: number;
        onlineCount: number;
        cameraCount: number;
        routerCount: number;
        iotCount: number;
    };
    scanStatus: IScanStatusResponse;
};

export const NetworkDeviceStatsHeader: React.FC<NetworkDeviceStatsHeaderProps> = ({
    stats,
    scanStatus,
}) => {
    const statusCfg =
        SCAN_STATUS_CONFIG[scanStatus.status] || SCAN_STATUS_CONFIG[NetworkScanStatus.IDLE];

    const alertTitle = `Tiến trình quét mạng: ${statusCfg.label}${
        scanStatus.devicesDiscoveredCount > 0
            ? ` (Đã phát hiện: ${scanStatus.devicesDiscoveredCount} thiết bị)`
            : ''
    }`;

    const alertDesc = scanStatus.startedAt
        ? `Bắt đầu lúc: ${new Date(scanStatus.startedAt).toLocaleTimeString()}`
        : undefined;

    return (
        <CustomSpace direction="vertical" size="middle" className="w-full">
            {/* Live Scan Alert Banner */}
            {scanStatus.status !== NetworkScanStatus.IDLE && (
                <CustomAlert
                    type={
                        scanStatus.status === NetworkScanStatus.SCANNING
                            ? 'info'
                            : scanStatus.status === NetworkScanStatus.COMPLETED
                              ? 'success'
                              : 'error'
                    }
                    showIcon
                    title={alertTitle}
                    description={alertDesc}
                />
            )}

            {/* Quick Summary Cards */}
            <CustomRow gutter={[16, 16]}>
                <CustomCol xs={12} sm={8} md={4} lg={4}>
                    <CustomCard
                        size="small"
                        className="!bg-slate-50 dark:!bg-slate-900 border-slate-200"
                    >
                        <Text type="secondary" className="text-xs block mb-1">
                            Tổng thiết bị
                        </Text>
                        <Title level={4} className="!mb-0 !text-blue-600">
                            {stats.total}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard
                        size="small"
                        className="!bg-emerald-50 dark:!bg-emerald-950/20 border-emerald-200"
                    >
                        <Text type="secondary" className="text-xs block mb-1">
                            Đang trực tuyến (Online)
                        </Text>
                        <Title level={4} className="!mb-0 !text-emerald-600">
                            {stats.onlineCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard
                        size="small"
                        className="!bg-sky-50 dark:!bg-sky-950/20 border-sky-200"
                    >
                        <Text type="secondary" className="text-xs block mb-1">
                            📹 Camera IP / ONVIF
                        </Text>
                        <Title level={4} className="!mb-0 !text-sky-600">
                            {stats.cameraCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard
                        size="small"
                        className="!bg-cyan-50 dark:!bg-cyan-950/20 border-cyan-200"
                    >
                        <Text type="secondary" className="text-xs block mb-1">
                            📡 Router / AP Wi-Fi
                        </Text>
                        <Title level={4} className="!mb-0 !text-cyan-600">
                            {stats.routerCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard
                        size="small"
                        className="!bg-amber-50 dark:!bg-amber-950/20 border-amber-200"
                    >
                        <Text type="secondary" className="text-xs block mb-1">
                            💡 Smart IoT
                        </Text>
                        <Title level={4} className="!mb-0 !text-amber-600">
                            {stats.iotCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
            </CustomRow>
        </CustomSpace>
    );
};
