'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type ICardAction,
    type IFilterField,
} from '@/components/common';
import {
    CustomBadge,
    CustomFlex,
    CustomSpace,
    CustomTag,
    CustomTypography,
    type ColumnsType,
} from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import {
    DeviceApproachModal,
    DeviceDetailModal,
    NetworkDeviceStatsHeader,
    NetworkScanModal,
} from './components';
import { DEVICE_TYPE_CONFIG } from './constants';
import { NetworkDeviceType } from './enums';
import { useNetworkDevicePage } from './hooks';
import { INetworkDevice } from './types';

const { Text } = CustomTypography;

export default function NetworkDevicePage() {
    const {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        currentScanStatus,
        isTriggeringScan,
        isExecutingApproach,
        isScanModalOpen,
        setIsScanModalOpen,
        selectedDeviceForDetail,
        setSelectedDeviceForDetail,
        selectedDeviceForApproach,
        setSelectedDeviceForApproach,
        approachResult,
        handleTriggerScan,
        handleExecuteApproach,
        handleOpenApproachFromDetail,
        stats,
    } = useNetworkDevicePage();

    // 1. Columns configuration for ListTable
    const columns: ColumnsType<INetworkDevice> = useMemo(
        () => [
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
        ],
        [],
    );

    // 2. Filter Fields for FilterPanel
    const filters: IFilterField[] = useMemo(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm IP, MAC, Vendor...',
                onSearch: (val?: string) => debouncedSearch(val || ''),
            },
            {
                name: 'deviceType',
                type: 'select',
                placeholder: 'Loại thiết bị',
                options: Object.entries(DEVICE_TYPE_CONFIG).map(([key, cfg]) => ({
                    value: key,
                    label: cfg.label,
                })),
                onChange: (val?: any) =>
                    setFilters([
                        {
                            value: val,
                            operator: 'eq',
                            field: 'deviceType',
                        },
                    ]),
            },
            {
                type: 'select',
                name: 'isOnline',
                placeholder: 'Trạng thái',
                options: [
                    { label: '🟢 Online', value: 'true' },
                    { label: '⚪ Offline', value: 'false' },
                ],
                onChange: (val?: any) =>
                    setFilters([
                        {
                            operator: 'eq',
                            field: 'isOnline',
                            value: val === undefined ? undefined : val === 'true',
                        },
                    ]),
            },
        ],
        [debouncedSearch, setFilters],
    );

    // 3. Actions for ListWrapper Header
    const actions: ICardAction[] = useMemo(
        () => [
            {
                key: 'refresh',
                label: 'Làm mới',
                icon: <Icon icon="mdi:refresh" />,
                onClick: () => tableQuery.refetch(),
                component: (
                    <button
                        onClick={() => tableQuery.refetch()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                        <Icon
                            icon="mdi:refresh"
                            className={tableQuery.isFetching ? 'animate-spin' : ''}
                        />
                        Làm mới
                    </button>
                ),
            },
            {
                key: 'scan',
                label: 'Quét Mạng Mới',
                icon: <Icon icon="mdi:radar" />,
                onClick: () => setIsScanModalOpen(true),
                component: (
                    <button
                        onClick={() => setIsScanModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Icon icon="mdi:radar" />
                        Quét Mạng Mới
                    </button>
                ),
            },
        ],
        [tableQuery, setIsScanModalOpen],
    );

    return (
        <CustomSpace direction="vertical" size="large" className="w-full">
            {/* Top Stats and Scan Banner */}
            <NetworkDeviceStatsHeader stats={stats} scanStatus={currentScanStatus} />

            {/* Standard ListWrapper & ListTable */}
            <ListWrapper
                actions={actions}
                isLoading={tableQuery.isLoading}
                filters={<FilterPanel fields={filters} />}
            >
                <ListTable<INetworkDevice>
                    columns={columns}
                    tableProps={tableProps}
                    tableQuery={tableQuery}
                    deleteResource={RESOURCE.NETWORK_DEVICES}
                    onView={(record) => setSelectedDeviceForDetail(record)}
                    customRowActions={[
                        {
                            key: 'approach',
                            tooltip: 'Chẩn đoán / Test approach ⚡',
                            onClick: (record) => setSelectedDeviceForApproach(record),
                            icon: <Icon icon="mdi:flash" className="text-amber-500 text-base" />,
                        },
                    ]}
                />
            </ListWrapper>

            <NetworkScanModal
                open={isScanModalOpen}
                loading={isTriggeringScan}
                onSubmit={handleTriggerScan}
                onClose={() => setIsScanModalOpen(false)}
            />

            <DeviceDetailModal
                device={selectedDeviceForDetail}
                open={Boolean(selectedDeviceForDetail)}
                onOpenApproach={handleOpenApproachFromDetail}
                onClose={() => setSelectedDeviceForDetail(null)}
            />

            <DeviceApproachModal
                result={approachResult}
                loading={isExecutingApproach}
                device={selectedDeviceForApproach}
                open={Boolean(selectedDeviceForApproach)}
                onExecute={handleExecuteApproach}
                onClose={() => setSelectedDeviceForApproach(null)}
            />
        </CustomSpace>
    );
}
