'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomMutationData } from '@/hooks';
import { useCallback, useState } from 'react';
import type {
    IApproachResultResponse,
    IExecuteApproachRequest,
    INetworkDevice,
    ITriggerScanRequest,
} from '../types';

export const useNetworkDeviceModals = (onScanTriggered?: () => Promise<unknown>) => {
    const { handleCustomMutationData: mutateTriggerScan } = useCustomMutationData();
    const { handleCustomMutationData: mutateExecuteApproach } = useCustomMutationData();

    const [isTriggeringScan, setIsTriggeringScan] = useState(false);
    const [isExecutingApproach, setIsExecutingApproach] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
        null,
    );
    const [selectedDeviceForApproach, setSelectedDeviceForApproach] =
        useState<INetworkDevice | null>(null);
    const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);

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
                if (onScanTriggered) {
                    await onScanTriggered();
                }
            } finally {
                setIsTriggeringScan(false);
            }
        },
        [mutateTriggerScan, onScanTriggered],
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

    return {
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
    };
};
