'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomData } from '@/hooks';

import { NetworkScanStatus } from '../enums';
import type { IScanStatusResponse } from '../types';

export const useNetworkScanStatus = () => {
    const { data: scanStatusData, query: scanStatusQuery } = useCustomData<IScanStatusResponse>({
        url: API_ENDPOINT.NETWORK_DEVICES.SCAN_STATUS,
        method: 'get',
        queryOptions: {
            refetchInterval: (query) => {
                const status =
                    (query.state.data as any)?.data?.status || (query.state.data as any)?.status;
                return status === NetworkScanStatus.SCANNING ? 2500 : false;
            },
        },
    });

    const currentScanStatus = scanStatusData || {
        status: NetworkScanStatus.IDLE,
        devicesDiscoveredCount: 0,
    };

    return {
        currentScanStatus,
        scanStatusQuery,
    };
};
