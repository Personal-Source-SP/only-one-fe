'use client';

import {
    CustomBadge,
    CustomButton,
    CustomDescriptions,
    CustomFlex,
    CustomModal,
    CustomSpace,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { DEVICE_TYPE_CONFIG } from '../constants';
import type { INetworkDevice } from '../types';
import { OnvifProfilesList } from './OnvifProfilesList';

const { Text } = CustomTypography;

type DeviceDetailModalProps = {
    device: INetworkDevice | null;
    open: boolean;
    onClose: () => void;
    onOpenApproach: (device: INetworkDevice) => void;
};

export const DeviceDetailModal = ({
    device,
    open,
    onClose,
    onOpenApproach,
}: DeviceDetailModalProps) => {
    if (!device) return null;

    const typeCfg = DEVICE_TYPE_CONFIG[device.deviceType] || DEVICE_TYPE_CONFIG.UNKNOWN;
    const onvif = device.onvifMetadata;

    return (
        <CustomModal
            title={
                <CustomFlex align="center" gap="small">
                    <Icon icon={typeCfg.icon} width={22} height={22} />
                    <span>Chi Tiết Thiết Bị: {device.ipAddress}</span>
                </CustomFlex>
            }
            open={open}
            onCancel={onClose}
            width={750}
            footer={[
                <CustomButton key="close" onClick={onClose}>
                    Đóng
                </CustomButton>,
                <CustomButton
                    key="approach"
                    type="primary"
                    icon={<Icon icon="mdi:flash" />}
                    onClick={() => onOpenApproach(device)}
                >
                    Chuyển sang Chẩn đoán ngay
                </CustomButton>,
            ]}
        >
            <CustomSpace direction="vertical" size="middle" className="w-full">
                {/* General Info */}
                <CustomDescriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                    <CustomDescriptions.Item label="Địa chỉ IP">
                        <Text strong copyable>
                            {device.ipAddress}
                        </Text>
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Trạng thái">
                        <CustomBadge
                            status={device.isOnline ? 'success' : 'default'}
                            text={device.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                        />
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Địa chỉ MAC">
                        {device.macAddress ? (
                            <Text copyable>{device.macAddress}</Text>
                        ) : (
                            <Text type="secondary">Chưa xác định</Text>
                        )}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Loại thiết bị">
                        <CustomTag color={typeCfg.color}>{typeCfg.label}</CustomTag>
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Nhà sản xuất (Vendor)">
                        {device.vendor || onvif?.deviceInformation?.manufacturer || 'Chưa xác định'}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Model">
                        {device.model || onvif?.deviceInformation?.model || 'Chưa xác định'}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Firmware">
                        {device.firmwareVersion ||
                            onvif?.deviceInformation?.firmwareVersion ||
                            'Chưa xác định'}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Lần cuối thấy">
                        {new Date(device.lastSeenAt).toLocaleString()}
                    </CustomDescriptions.Item>
                    <CustomDescriptions.Item label="Cổng mở (Open Ports)" span={2}>
                        {device.openPorts?.length > 0 ? (
                            <CustomFlex gap="4px" wrap="wrap">
                                {device.openPorts.map((port) => (
                                    <CustomTag key={port} color="cyan">
                                        Port {port}
                                    </CustomTag>
                                ))}
                            </CustomFlex>
                        ) : (
                            <Text type="secondary">Không phát hiện cổng mở</Text>
                        )}
                    </CustomDescriptions.Item>
                </CustomDescriptions>

                {/* ONVIF Metadata */}
                <OnvifProfilesList onvif={onvif} />
            </CustomSpace>
        </CustomModal>
    );
};
