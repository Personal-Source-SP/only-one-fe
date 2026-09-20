'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';

import { DetailModalContainer } from '@/components';
import { CustomButton, CustomFlex, CustomTag } from '@/components';
import type { UseCustomModalDetailReturnType } from '@/hooks';
import type { IDetailSection } from '@/interfaces';

import { DEVICE_TYPE_CONFIG } from '../constants';
import type { INetworkDevice } from '../types';
import { OnvifProfilesList } from './OnvifProfilesList';

type DeviceDetailModalProps = {
    detailModal: UseCustomModalDetailReturnType<INetworkDevice, INetworkDevice>;
    onOpenApproach: (device: INetworkDevice) => void;
};

export const DeviceDetailModal = ({ detailModal, onOpenApproach }: DeviceDetailModalProps) => {
    const device = detailModal.data;
    const typeCfg = device
        ? DEVICE_TYPE_CONFIG[device.deviceType] || DEVICE_TYPE_CONFIG.UNKNOWN
        : null;

    const sections: IDetailSection<INetworkDevice>[] = useMemo(
        () => [
            {
                type: 'descriptions',
                bordered: true,
                size: 'small',
                column: { xs: 1, sm: 2 },
                items: [
                    {
                        name: 'ipAddress',
                        label: 'Địa chỉ IP',
                        copyable: true,
                        strong: true,
                    },
                    {
                        name: 'isOnline',
                        label: 'Trạng thái',
                        format: 'badge',
                        badgeProps: (val) => ({
                            status: val ? 'success' : 'default',
                            text: val ? 'Đang trực tuyến' : 'Ngoại tuyến',
                        }),
                    },
                    {
                        name: 'macAddress',
                        label: 'Địa chỉ MAC',
                        copyable: true,
                        emptyText: 'Chưa xác định',
                    },
                    {
                        name: 'deviceType',
                        label: 'Loại thiết bị',
                        render: () =>
                            typeCfg ? (
                                <CustomTag color={typeCfg.color}>{typeCfg.label}</CustomTag>
                            ) : null,
                    },
                    {
                        name: 'vendor',
                        label: 'Nhà sản xuất (Vendor)',
                        render: (_, record) =>
                            record.vendor ||
                            record.onvifMetadata?.deviceInformation?.manufacturer ||
                            'Chưa xác định',
                    },
                    {
                        name: 'model',
                        label: 'Model',
                        render: (_, record) =>
                            record.model ||
                            record.onvifMetadata?.deviceInformation?.model ||
                            'Chưa xác định',
                    },
                    {
                        name: 'firmwareVersion',
                        label: 'Firmware',
                        render: (_, record) =>
                            record.firmwareVersion ||
                            record.onvifMetadata?.deviceInformation?.firmwareVersion ||
                            'Chưa xác định',
                    },
                    {
                        name: 'lastSeenAt',
                        label: 'Lần cuối thấy',
                        format: 'datetime',
                    },
                    {
                        name: 'openPorts',
                        label: 'Cổng mở (Open Ports)',
                        span: 2,
                        render: (ports) => {
                            const portList = ports as number[] | undefined;
                            if (!portList?.length) return 'Không phát hiện cổng mở';
                            return (
                                <CustomFlex gap="4px" wrap="wrap">
                                    {portList.map((port) => (
                                        <CustomTag key={port} color="cyan">
                                            Port {port}
                                        </CustomTag>
                                    ))}
                                </CustomFlex>
                            );
                        },
                    },
                ],
            },
            {
                type: 'custom',
                visible: (record) => Boolean(record.onvifMetadata),
                render: (record) => <OnvifProfilesList onvif={record.onvifMetadata} />,
            },
        ],
        [typeCfg],
    );

    const modalTitle = useMemo(() => {
        const titleText = device ? `Chi Tiết Thiết Bị: ${device.ipAddress}` : 'Chi Tiết Thiết Bị';
        if (!typeCfg) return titleText;

        return (
            <CustomFlex align="center" gap="small">
                <Icon icon={typeCfg.icon} width={22} height={22} />
                <span>{titleText}</span>
            </CustomFlex>
        );
    }, [device, typeCfg]);

    return (
        <DetailModalContainer<INetworkDevice>
            detailModal={detailModal}
            width={750}
            sections={sections}
            title={modalTitle}
            extraActions={(d) => (
                <CustomButton
                    key="approach"
                    type="primary"
                    icon={<Icon icon="mdi:flash" />}
                    onClick={() => onOpenApproach(d)}
                >
                    Chuyển sang Chẩn đoán ngay
                </CustomButton>
            )}
        />
    );
};
