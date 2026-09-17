'use client';

import {
    CustomBadge,
    CustomButton,
    CustomCard,
    CustomDescriptions,
    CustomFlex,
    CustomModal,
    CustomSpace,
    CustomTag,
    CustomTypography,
    customMessage,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import React from 'react';
import { DEVICE_TYPE_CONFIG } from '../constants';
import { INetworkDevice } from '../types';

const { Text } = CustomTypography;

type DeviceDetailModalProps = {
    device: INetworkDevice | null;
    open: boolean;
    onClose: () => void;
    onOpenApproach: (device: INetworkDevice) => void;
};

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
    device,
    open,
    onClose,
    onOpenApproach,
}) => {
    if (!device) return null;

    const typeCfg = DEVICE_TYPE_CONFIG[device.deviceType] || DEVICE_TYPE_CONFIG.UNKNOWN;
    const onvif = device.onvifMetadata;

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        customMessage.success(`Đã sao chép ${label}`);
    };

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
                {onvif && (
                    <div>
                        <Text strong className="block mb-2 text-sm">
                            📹 Siêu dữ liệu ONVIF (Profiles & RTSP Streams):
                        </Text>
                        {onvif.streamProfiles && onvif.streamProfiles.length > 0 ? (
                            <CustomSpace direction="vertical" size="small" className="w-full">
                                {onvif.streamProfiles.map((p, idx) => (
                                    <CustomCard
                                        key={idx}
                                        size="small"
                                        className="bg-slate-50 dark:bg-slate-900"
                                    >
                                        <CustomFlex
                                            justify="space-between"
                                            align="center"
                                            className="mb-2"
                                        >
                                            <Text strong className="text-blue-600">
                                                [{p.name || p.token}] {p.videoEncoding || 'H.264'}
                                                {p.resolution &&
                                                    ` - ${p.resolution.width}x${p.resolution.height}`}
                                                {p.frameRateLimit && ` @ ${p.frameRateLimit}fps`}
                                            </Text>
                                        </CustomFlex>
                                        {p.streamUri && (
                                            <CustomFlex
                                                justify="space-between"
                                                align="center"
                                                gap="small"
                                                className="mb-1"
                                            >
                                                <Text
                                                    className="text-xs break-all"
                                                    type="secondary"
                                                >
                                                    RTSP: {p.streamUri}
                                                </Text>
                                                <CustomButton
                                                    size="small"
                                                    type="text"
                                                    icon={<Icon icon="mdi:content-copy" />}
                                                    onClick={() =>
                                                        handleCopy(p.streamUri!, 'RTSP URL')
                                                    }
                                                >
                                                    Copy
                                                </CustomButton>
                                            </CustomFlex>
                                        )}
                                        {p.snapshotUri && (
                                            <CustomFlex
                                                justify="space-between"
                                                align="center"
                                                gap="small"
                                            >
                                                <Text
                                                    className="text-xs break-all"
                                                    type="secondary"
                                                >
                                                    Snapshot: {p.snapshotUri}
                                                </Text>
                                                <CustomButton
                                                    size="small"
                                                    type="text"
                                                    icon={<Icon icon="mdi:content-copy" />}
                                                    onClick={() =>
                                                        handleCopy(p.snapshotUri!, 'Snapshot URL')
                                                    }
                                                >
                                                    Copy
                                                </CustomButton>
                                            </CustomFlex>
                                        )}
                                    </CustomCard>
                                ))}
                            </CustomSpace>
                        ) : (
                            <Text type="secondary" className="text-xs">
                                Chưa có profile luồng video nào được trích xuất.
                            </Text>
                        )}
                    </div>
                )}
            </CustomSpace>
        </CustomModal>
    );
};
