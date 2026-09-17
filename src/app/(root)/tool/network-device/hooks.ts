'use client';

import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomData, useCustomMutationData, useCustomTable } from '@/hooks';
import { useCallback, useMemo, useState } from 'react';
import { NetworkDeviceType, NetworkScanStatus } from './enums';
import {
    IApproachResultResponse,
    IExecuteApproachRequest,
    INetworkDevice,
    IScanStatusResponse,
    ITriggerScanRequest,
} from './types';

export const useNetworkDevicePage = () => {
    // 1. Table Data & Query using Refine useCustomTable
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<INetworkDevice>({
            resource: RESOURCE.NETWORK_DEVICES,
        });

    // 2. Scan Status Polling Query
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

    // 3. Mutations
    const { handleCustomMutationData: mutateTriggerScan } = useCustomMutationData();
    const { handleCustomMutationData: mutateExecuteApproach } = useCustomMutationData();

    // 4. Modals & Drawer State
    const [isTriggeringScan, setIsTriggeringScan] = useState(false);
    const [isExecutingApproach, setIsExecutingApproach] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
        null,
    );
    const [selectedDeviceForApproach, setSelectedDeviceForApproach] =
        useState<INetworkDevice | null>(null);
    const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);

    // 5. Action Handlers
    const handleTriggerScan = useCallback(
        async (values: ITriggerScanRequest) => {
            setIsTriggeringScan(true);
            try {
                await mutateTriggerScan({
                    url: API_ENDPOINT.NETWORK_DEVICES.SCAN,
                    method: 'post',
                    values,
                    successNotification: {
                        type: 'success',
                        message: 'Đã kích hoạt quét mạng bất đồng bộ thành công',
                    },
                });
                setIsScanModalOpen(false);
                await scanStatusQuery.refetch();
            } finally {
                setIsTriggeringScan(false);
            }
        },
        [mutateTriggerScan, scanStatusQuery],
    );

    const handleExecuteApproach = useCallback(
        async (payload: IExecuteApproachRequest) => {
            setIsExecutingApproach(true);
            setApproachResult(null);
            try {
                const res = (await mutateExecuteApproach({
                    url: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
                    method: 'post',
                    values: payload,
                    successNotification: {
                        type: 'success',
                        message: 'Thực thi chẩn đoán hoàn tất',
                    },
                })) as unknown as IApproachResultResponse;
                setApproachResult(res);
            } finally {
                setIsExecutingApproach(false);
            }
        },
        [mutateExecuteApproach],
    );

    const handleOpenApproachFromDetail = useCallback((device: INetworkDevice) => {
        setSelectedDeviceForDetail(null);
        setSelectedDeviceForApproach(device);
    }, []);

    // 6. Computed Stats
    const stats = useMemo(() => {
        const devices = (tableProps?.dataSource as INetworkDevice[]) || [];
        const total = tableProps?.pagination
            ? (tableProps.pagination as any).total || devices.length
            : devices.length;
        const onlineCount = devices.filter((d) => d.isOnline).length;
        const cameraCount = devices.filter((d) => d.deviceType === NetworkDeviceType.CAMERA).length;
        const routerCount = devices.filter(
            (d) => d.deviceType === NetworkDeviceType.ROUTER_AP,
        ).length;
        const iotCount = devices.filter((d) => d.deviceType === NetworkDeviceType.SMART_IOT).length;

        return { total, onlineCount, cameraCount, routerCount, iotCount };
    }, [tableProps]);

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        currentScanStatus,
        scanStatusQuery,
        isTriggeringScan,
        isExecutingApproach,
        isScanModalOpen,
        setIsScanModalOpen,
        selectedDeviceForDetail,
        setSelectedDeviceForDetail,
        selectedDeviceForApproach,
        setSelectedDeviceForApproach,
        approachResult,
        setApproachResult,
        handleTriggerScan,
        handleExecuteApproach,
        handleOpenApproachFromDetail,
        stats,
    };
};
