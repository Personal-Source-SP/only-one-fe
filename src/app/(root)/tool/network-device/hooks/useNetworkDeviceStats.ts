'use client';

import { useMemo } from 'react';

import { NetworkDeviceType } from '../enums';
import type { INetworkDevice } from '../types';

type TableLike = {
    tableProps?: {
        dataSource?: unknown;
        pagination?: unknown;
    };
};

export const useNetworkDeviceStats = (table: TableLike) => {
    const stats = useMemo(() => {
        const devices = Array.isArray(table.tableProps?.dataSource)
            ? (table.tableProps.dataSource as INetworkDevice[])
            : [];
        const total = table.tableProps?.pagination
            ? (table.tableProps.pagination as { total?: number }).total || devices.length
            : devices.length;
        const onlineCount = devices.filter((d) => d.isOnline).length;
        const cameraCount = devices.filter((d) => d.deviceType === NetworkDeviceType.CAMERA).length;
        const routerCount = devices.filter(
            (d) => d.deviceType === NetworkDeviceType.ROUTER_AP,
        ).length;
        const iotCount = devices.filter((d) => d.deviceType === NetworkDeviceType.SMART_IOT).length;

        return { total, onlineCount, cameraCount, routerCount, iotCount };
    }, [table.tableProps]);

    return { stats };
};
