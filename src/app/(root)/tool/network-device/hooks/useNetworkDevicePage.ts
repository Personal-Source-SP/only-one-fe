'use client';

import { RESOURCE } from '@/config';
import { useCustomTable } from '@/hooks';
import type { INetworkDevice } from '../types';
import { useNetworkDeviceModals } from './useNetworkDeviceModals';
import { useNetworkDeviceStats } from './useNetworkDeviceStats';
import { useNetworkScanStatus } from './useNetworkScanStatus';

export const useNetworkDevicePage = () => {
    const table = useCustomTable<INetworkDevice>({
        resource: RESOURCE.NETWORK_DEVICES,
    });

    const { currentScanStatus, scanStatusQuery } = useNetworkScanStatus();

    const modals = useNetworkDeviceModals(async () => {
        await scanStatusQuery.refetch();
    });

    const { stats } = useNetworkDeviceStats(table);

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        setCurrentPage: table.setCurrentPage,
        currentScanStatus,
        scanStatusQuery,
        stats,
        ...modals,
    };
};
