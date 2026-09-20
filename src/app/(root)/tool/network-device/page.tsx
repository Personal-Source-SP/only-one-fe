'use client';

import { Icon } from '@iconify/react';

import { type ICardAction, type IFilterField, ListContainer, ListTable } from '@/components';
import {
    type ColumnsType,
    CustomBadge,
    CustomButton,
    CustomFlex,
    CustomSpace,
    CustomTag,
    CustomTypography,
} from '@/components';
import { RESOURCE } from '@/config';

import {
    DeviceApproachModal,
    DeviceDetailModal,
    NetworkDeviceStatsHeader,
    NetworkScanModal,
} from './components';
import { DEVICE_TYPE_CONFIG } from './constants';
import { NetworkDeviceType } from './enums';
import { useNetworkDevicePage } from './hooks';
import type { INetworkDevice } from './types';

const { Text } = CustomTypography;

export default function NetworkDevicePage() {
    const {
        table,
        debouncedSearch,
        setFilters,
        currentScanStatus,
        scanModalForm,
        approachModalForm,
        selectedDeviceForDetail,
        setSelectedDeviceForDetail,
        approachResult,
        handleOpenApproach,
        handleOpenApproachFromDetail,
        stats,
    } = useNetworkDevicePage();

    const columns: ColumnsType<INetworkDevice> = [
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 140,
            render: (ip: string, record) => (
                <CustomSpace direction="vertical" size={2}>
                    <Text strong copyable className="text-sm">
                        {ip}
                    </Text>
                    <CustomBadge
                        status={record.isOnline ? 'success' : 'default'}
                        text={record.isOnline ? 'Online' : 'Offline'}
                    />
                </CustomSpace>
            ),
        },
        {
            title: 'MAC & Nhà sản xuất',
            key: 'macVendor',
            width: 200,
            render: (_, record) => (
                <div>
                    <Text className="text-xs font-mono block">{record.macAddress || '—'}</Text>
                    <Text type="secondary" className="text-xs block">
                        {record.vendor ||
                            record.onvifMetadata?.deviceInformation?.manufacturer ||
                            'Unknown Vendor'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Loại Thiết Bị',
            dataIndex: 'deviceType',
            key: 'deviceType',
            width: 160,
            render: (type: NetworkDeviceType) => {
                const cfg = DEVICE_TYPE_CONFIG[type] || DEVICE_TYPE_CONFIG.UNKNOWN;
                return (
                    <CustomTag color={cfg.color} className="flex items-center gap-1 w-fit">
                        <Icon icon={cfg.icon} width={14} height={14} />
                        <span>{cfg.label}</span>
                    </CustomTag>
                );
            },
        },
        {
            title: 'Model / Firmware',
            key: 'modelFirmware',
            render: (_, record) => (
                <div>
                    <Text className="text-xs block">
                        {record.model || record.onvifMetadata?.deviceInformation?.model || '—'}
                    </Text>
                    <Text type="secondary" className="text-xs block">
                        {record.firmwareVersion ||
                            record.onvifMetadata?.deviceInformation?.firmwareVersion ||
                            '—'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Open Ports',
            dataIndex: 'openPorts',
            key: 'openPorts',
            width: 170,
            render: (ports: number[]) => {
                if (!ports || ports.length === 0) {
                    return (
                        <Text type="secondary" className="text-xs">
                            —
                        </Text>
                    );
                }
                return (
                    <CustomFlex gap="4px" wrap="wrap">
                        {ports.slice(0, 4).map((p) => (
                            <CustomTag key={p} color="blue" className="text-[11px] !m-0">
                                {p}
                            </CustomTag>
                        ))}
                        {ports.length > 4 && (
                            <CustomTag color="default" className="text-[11px] !m-0">
                                +{ports.length - 4}
                            </CustomTag>
                        )}
                    </CustomFlex>
                );
            },
        },
        {
            title: 'Lần Thấy Cuối',
            dataIndex: 'lastSeenAt',
            key: 'lastSeenAt',
            width: 150,
            render: (time: string) => (
                <Text type="secondary" className="text-xs">
                    {time ? new Date(time).toLocaleString() : '—'}
                </Text>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm IP, MAC, Vendor...',
            onChange: (val) => debouncedSearch(val?.toString() ?? ''),
        },
        {
            name: 'deviceType',
            type: 'select',
            placeholder: 'Loại thiết bị',
            options: Object.entries(DEVICE_TYPE_CONFIG).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
            })),
            onChange: (val) => setFilters([{ value: val, operator: 'eq', field: 'deviceType' }]),
        },
        {
            type: 'select',
            name: 'isOnline',
            placeholder: 'Trạng thái',
            options: [
                { label: '🟢 Online', value: 'true' },
                { label: '⚪ Offline', value: 'false' },
            ],
            onChange: (val) =>
                setFilters([
                    {
                        operator: 'eq',
                        field: 'isOnline',
                        value: val === undefined ? undefined : val === 'true',
                    },
                ]),
        },
    ];

    const actions: ICardAction[] = [
        {
            key: 'refresh',
            label: 'Làm mới',
            icon: <Icon icon="mdi:refresh" />,
            onClick: () => table.tableQuery.refetch(),
            component: (
                <CustomButton
                    onClick={() => table.tableQuery.refetch()}
                    icon={
                        <Icon
                            icon="mdi:refresh"
                            className={table.tableQuery.isFetching ? 'animate-spin' : ''}
                        />
                    }
                >
                    Làm mới
                </CustomButton>
            ),
        },
        {
            key: 'scan',
            label: 'Quét Mạng Mới',
            icon: <Icon icon="mdi:radar" />,
            onClick: () => scanModalForm.show(),
            component: (
                <CustomButton
                    type="primary"
                    icon={<Icon icon="mdi:radar" />}
                    onClick={() => scanModalForm.show()}
                >
                    Quét Mạng Mới
                </CustomButton>
            ),
        },
    ];

    return (
        <>
            <ListContainer
                actions={actions}
                filters={filters}
                top={<NetworkDeviceStatsHeader stats={stats} scanStatus={currentScanStatus} />}
            >
                <ListTable<INetworkDevice>
                    table={table}
                    columns={columns}
                    deleteResource={RESOURCE.NETWORK_DEVICES}
                    onView={(record) => setSelectedDeviceForDetail(record)}
                    customRowActions={[
                        {
                            key: 'approach',
                            tooltip: 'Chẩn đoán / Test approach ⚡',
                            onClick: (record) => handleOpenApproach(record),
                            icon: <Icon icon="mdi:flash" className="text-amber-500 text-base" />,
                        },
                    ]}
                />
            </ListContainer>

            <NetworkScanModal modalForm={scanModalForm} />

            <DeviceDetailModal
                device={selectedDeviceForDetail}
                open={Boolean(selectedDeviceForDetail)}
                onOpenApproach={handleOpenApproachFromDetail}
                onClose={() => setSelectedDeviceForDetail(null)}
            />

            <DeviceApproachModal result={approachResult} modalForm={approachModalForm} />
        </>
    );
}
