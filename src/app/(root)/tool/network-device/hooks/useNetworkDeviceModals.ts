'use client';

import { useCallback, useState } from 'react';
import type { BaseRecord } from '@refinedev/core';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm } from '@/hooks';

import { NetworkDeviceApproachEnum } from '../enums';
import type {
    IApproachResultResponse,
    IExecuteApproachRequest,
    INetworkDevice,
    ITriggerScanRequest,
} from '../types';

export const useNetworkDeviceModals = (onScanTriggered?: () => Promise<unknown>) => {
    const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(
        null,
    );
    const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);

    const scanModalForm = useCustomModalForm<BaseRecord, ITriggerScanRequest>({
        action: 'create',
        resource: API_ENDPOINT.NETWORK_DEVICES.SCAN,
        successNotification: {
            type: 'success',
            message: 'Đã kích hoạt quét mạng bất đồng bộ thành công',
        },
        onMutationSuccess: async () => {
            if (onScanTriggered) {
                await onScanTriggered();
            }
        },
    });

    const approachModalForm = useCustomModalForm<BaseRecord, IExecuteApproachRequest>({
        action: 'create',
        resource: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
        autoResetForm: false,
        successNotification: {
            type: 'success',
            message: 'Thực thi chẩn đoán hoàn tất',
        },
        onMutationSuccess: (data) => {
            setApproachResult(data?.data as unknown as IApproachResultResponse);
        },
    });

    const handleOpenApproach = useCallback(
        (device: INetworkDevice) => {
            setApproachResult(null);
            approachModalForm.show();
            approachModalForm.formProps.form?.setFieldsValue({
                approach: NetworkDeviceApproachEnum.PROTOCOL_AUTH,
                ip: device?.ipAddress || '',
                mac: device?.macAddress || '',
                timeoutMs: 3000,
                ports: device?.openPorts?.length ? device.openPorts : [80, 554, 8000, 37777],
                credentials: [
                    { username: 'admin', password: '' },
                    { username: 'admin', password: 'admin' },
                ],
            });
        },
        [approachModalForm],
    );

    const handleOpenApproachFromDetail = useCallback(
        (device: INetworkDevice) => {
            setSelectedDeviceForDetail(null);
            handleOpenApproach(device);
        },
        [handleOpenApproach],
    );

    return {
        scanModalForm,
        approachModalForm,
        selectedDeviceForDetail,
        setSelectedDeviceForDetail,
        approachResult,
        setApproachResult,
        handleOpenApproach,
        handleOpenApproachFromDetail,
    };
};
