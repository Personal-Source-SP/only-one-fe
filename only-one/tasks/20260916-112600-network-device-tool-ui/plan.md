---
status: done
slug: network-device-tool-ui
started_at: 2026-09-16
completed_at: 2026-09-16
pr_url: ~
branch: ~
---

# Plan: Triển khai Giao diện Quản lý & Chẩn đoán Thiết bị Mạng (/tool/network-device)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Backend Ready**: Module `network-device` trong `only-one-be` đã cung cấp đầy đủ các API:
  - `GET /network-devices` (CRUD / List với phân trang, tìm kiếm, lọc theo `BaseController`).
  - `POST /network-devices/scan` (Kích hoạt quét subnet bất đồng bộ).
  - `GET /network-devices/scan/status` (Lấy trạng thái quét mạng thời gian thực).
  - `POST /network-devices/approach/execute` (Thực thi kiểm thử tiếp cận `NETWORK_DISCOVERY`, `PORT_SCAN`, `PROTOCOL_AUTH`).
- **Frontend Standard Alignment**: Tuân thủ 100% Design System & Layout Pattern chuẩn của dự án:
  - Sử dụng `<ListWrapper />` kết hợp `<FilterPanel />` cho thanh điều hướng, bộ lọc đa trường và các nút action (Quét Mạng Mới, Làm mới).
  - Sử dụng `<ListTable<INetworkDevice> />` chuẩn (`@/components/common`) để tự động hóa phân trang, quyền hạn, `deleteResource`, `onView`, `customRowActions` (Chẩn đoán ⚡).
- **Invariants**:
  - Tận dụng 100% các custom hooks và components chuẩn trong `@/hooks` (`useCustomTable`, `useCustomMutationData`, `useCustomData`) và `@/components/common`, `@/components/custom-antd`.
  - Không thay đổi bất kỳ dòng code nào dưới Backend.
  - Tuân thủ cấu trúc Colocation chuẩn: Đặt types, enums, constants, hooks, components ngay bên trong thư mục module `src/app/(root)/tool/network-device/`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Type Signatures & Code Contracts

```typescript
// Enums
export enum NetworkDeviceType {
    CAMERA = 'CAMERA',
    ROUTER_AP = 'ROUTER_AP',
    COMPUTER_PHONE = 'COMPUTER_PHONE',
    SMART_IOT = 'SMART_IOT',
    PRINTER = 'PRINTER',
    UNKNOWN = 'UNKNOWN',
}

export enum NetworkDeviceApproachEnum {
    NETWORK_DISCOVERY = 'NETWORK_DISCOVERY',
    PORT_SCAN = 'PORT_SCAN',
    PROTOCOL_AUTH = 'PROTOCOL_AUTH',
}

export enum NetworkScanStatus {
    IDLE = 'IDLE',
    SCANNING = 'SCANNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

// Data Models
export interface IStreamProfile {
    token: string;
    name: string;
    videoEncoding?: string;
    resolution?: { width: number; height: number };
    frameRateLimit?: number;
    streamUri?: string;
    snapshotUri?: string;
}

export interface IOnvifMetadata {
    deviceInformation?: {
        manufacturer?: string;
        model?: string;
        firmwareVersion?: string;
        serialNumber?: string;
        hardwareId?: string;
    };
    streamProfiles?: IStreamProfile[];
    scopes?: string[];
    xAddrs?: string[];
}

export interface INetworkDevice {
    id: string;
    ipAddress: string;
    macAddress?: string | null;
    deviceType: NetworkDeviceType;
    vendor?: string | null;
    model?: string | null;
    firmwareVersion?: string | null;
    openPorts: number[];
    onvifMetadata?: IOnvifMetadata | null;
    isOnline: boolean;
    lastSeenAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IScanStatusResponse {
    status: NetworkScanStatus;
    devicesDiscoveredCount: number;
    startedAt?: string | null;
    completedAt?: string | null;
}

export interface ITriggerScanRequest {
    subnet?: string;
    probeTimeoutMs?: number;
}

export interface IDeviceCredential {
    username: string;
    password?: string;
    port?: number;
    protocol?: string;
}

export interface IExecuteApproachRequest {
    approach: NetworkDeviceApproachEnum;
    ip?: string;
    mac?: string;
    subnet?: string;
    ports?: number[];
    credentials?: IDeviceCredential[];
    timeoutMs?: number;
}

export interface IApproachResultResponse<TData = any> {
    isSuccess: boolean;
    approach: NetworkDeviceApproachEnum;
    target: { ip?: string; mac?: string; subnet?: string };
    matchedCredential?: IDeviceCredential;
    data?: TData;
    responseTimeMs: number;
    errorMessage?: string;
}
```

### 2.2 AST Seams & Callers

1. **Config Endpoints**: `src/config/endpoint.ts` $\rightarrow$ Thêm `API_ENDPOINT.NETWORK_DEVICES` & `RESOURCE.NETWORK_DEVICES`.
2. **Sidebar Navigation**: `src/constants/sidebar.constant.ts` $\rightarrow$ Thêm nhóm menu `Công cụ` $\rightarrow$ `Thiết bị mạng` (`/tool/network-device`).
3. **List & Polling Hook Seam**: `useNetworkDevicePage` trong `hooks.ts` quản lý `useCustomTable` kết nối với `ListTable`, kết hợp polling `useCustomData` cho `scanStatusQuery`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── config/
│   └── [MODIFY] endpoint.ts                     # Thêm endpoint & resource cho NETWORK_DEVICES
├── constants/
│   └── [MODIFY] sidebar.constant.ts             # Thêm menu Công cụ -> Thiết bị mạng
└── app/(root)/tool/
    └── network-device/
        ├── [NEW] enums/
        │   └── index.ts                         # NetworkDeviceType, Approach, ScanStatus enums
        ├── [NEW] types/
        │   └── index.ts                         # INetworkDevice, IScanStatus, IApproach DTOs
        ├── [NEW] constants/
        │   └── index.ts                         # Options, badge colors, icons mapping
        ├── [NEW] hooks.ts                       # useNetworkDevicePage & polling logic
        ├── [NEW] components/
        │   ├── NetworkDeviceStatsHeader.tsx     # Thống kê counter, alert banner tiến trình scan
        │   ├── NetworkScanModal.tsx             # Modal cấu hình quét subnet
        │   ├── DeviceApproachDrawer.tsx         # Drawer chẩn đoán & test credentials/ports
        │   ├── DeviceDetailModal.tsx            # Modal xem chi tiết phần cứng & ONVIF Stream profiles
        │   └── index.ts                         # Barrel export
        └── [NEW] page.tsx                       # Trang giao diện chính sử dụng ListWrapper + FilterPanel + ListTable
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/config/endpoint.ts` | `API_ENDPOINT.NETWORK_DEVICES`, `RESOURCE.NETWORK_DEVICES` | None | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/constants/sidebar.constant.ts` | `SIDEBAR_ITEMS` | None | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/enums/index.ts` | `NetworkDeviceType`, `NetworkDeviceApproachEnum`, `NetworkScanStatus` | None | `npm run lint` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/types/index.ts` | `INetworkDevice`, `IOnvifMetadata`, `IScanStatusResponse`, `IExecuteApproachRequest` | Order 3 | `npm run lint` |
| **5** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/constants/index.ts` | `DEVICE_TYPE_OPTIONS`, `DEVICE_TYPE_CONFIG`, `SCAN_STATUS_CONFIG` | Order 3, 4 | `npm run lint` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/hooks.ts` | `useNetworkDevicePage` | Order 1, 4, 5 | `npm run lint` |
| **7** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx` | `NetworkDeviceStatsHeader` | Order 5, 6 | `npm run lint` |
| **8** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx` | `NetworkScanModal` | Order 4, 6 | `npm run lint` |
| **9** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx` | `DeviceDetailModal` | Order 4, 5 | `npm run lint` |
| **10** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/DeviceApproachDrawer.tsx` | `DeviceApproachDrawer` | Order 3, 4, 6 | `npm run lint` |
| **11** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/components/index.ts` | Barrel exports | Order 7-10 | `npm run lint` |
| **12** | `[x]` | `[NEW]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` (ListWrapper + ListTable) | Order 6, 11 | `npm run lint` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/config/endpoint.ts`
> **Action**: Bổ sung endpoint và resource cho module `NETWORK_DEVICES`.

```diff
@@ -137,6 +137,14 @@
         STATUS: '/api/tunnel/status',
     },
+    NETWORK_DEVICES: {
+        BASE: prefix('network-devices'),
+        ALL: prefix('network-devices/all'),
+        DETAIL: (id: string | number) => prefix(`network-devices/${id}`),
+        SCAN: prefix('network-devices/scan'),
+        SCAN_STATUS: prefix('network-devices/scan/status'),
+        APPROACH_EXECUTE: prefix('network-devices/approach/execute'),
+    },
 } as const;
 
 export const RESOURCE = {
@@ -159,4 +167,5 @@
     USERS: API_ENDPOINT.USERS.BASE,
     NOTIFICATIONS: API_ENDPOINT.NOTIFICATIONS.BASE,
     SETTINGS: API_ENDPOINT.SETTINGS.BASE,
+    NETWORK_DEVICES: API_ENDPOINT.NETWORK_DEVICES.BASE,
 } as const;
```

---

### 2. `[MODIFY]` `src/constants/sidebar.constant.ts`
> **Action**: Thêm danh mục "Công cụ" và menu "Thiết bị mạng" vào Sidebar.

```diff
@@ -127,6 +127,19 @@
         ],
     },
+    {
+        label: 'Công cụ',
+        icon: 'noto:hammer-and-wrench',
+        sectionHref: '/tool/network-device',
+        children: [
+            {
+                label: 'Thiết bị mạng',
+                icon: 'noto:satellite-antenna',
+                href: '/tool/network-device',
+                description: 'Quản lý, quét mạng và chẩn đoán thiết bị',
+            },
+        ],
+    },
     {
         label: 'Quản lý',
         icon: 'flat-color-icons:settings',
```

---

### 3. `[NEW]` `src/app/(root)/tool/network-device/enums/index.ts`
> **Action**: Định nghĩa các enum đồng bộ với backend.

```typescript
export enum NetworkDeviceType {
    CAMERA = 'CAMERA',
    ROUTER_AP = 'ROUTER_AP',
    COMPUTER_PHONE = 'COMPUTER_PHONE',
    SMART_IOT = 'SMART_IOT',
    PRINTER = 'PRINTER',
    UNKNOWN = 'UNKNOWN',
}

export enum NetworkDeviceApproachEnum {
    NETWORK_DISCOVERY = 'NETWORK_DISCOVERY',
    PORT_SCAN = 'PORT_SCAN',
    PROTOCOL_AUTH = 'PROTOCOL_AUTH',
}

export enum NetworkScanStatus {
    IDLE = 'IDLE',
    SCANNING = 'SCANNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}
```

---

### 4. `[NEW]` `src/app/(root)/tool/network-device/types/index.ts`
> **Action**: Khai báo các type và interface cho module Network Device.

```typescript
import { NetworkDeviceApproachEnum, NetworkDeviceType, NetworkScanStatus } from '../enums';

export interface IStreamProfile {
    token: string;
    name: string;
    videoEncoding?: string;
    resolution?: {
        width: number;
        height: number;
    };
    frameRateLimit?: number;
    streamUri?: string;
    snapshotUri?: string;
}

export interface IOnvifMetadata {
    deviceInformation?: {
        manufacturer?: string;
        model?: string;
        firmwareVersion?: string;
        serialNumber?: string;
        hardwareId?: string;
    };
    streamProfiles?: IStreamProfile[];
    scopes?: string[];
    xAddrs?: string[];
}

export interface INetworkDevice {
    id: string;
    ipAddress: string;
    macAddress?: string | null;
    deviceType: NetworkDeviceType;
    vendor?: string | null;
    model?: string | null;
    firmwareVersion?: string | null;
    openPorts: number[];
    onvifMetadata?: IOnvifMetadata | null;
    isOnline: boolean;
    lastSeenAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IScanStatusResponse {
    status: NetworkScanStatus;
    devicesDiscoveredCount: number;
    startedAt?: string | null;
    completedAt?: string | null;
}

export interface ITriggerScanRequest {
    subnet?: string;
    probeTimeoutMs?: number;
}

export interface IDeviceCredential {
    username: string;
    password?: string;
    port?: number;
    protocol?: string;
}

export interface IExecuteApproachRequest {
    approach: NetworkDeviceApproachEnum;
    ip?: string;
    mac?: string;
    subnet?: string;
    ports?: number[];
    credentials?: IDeviceCredential[];
    timeoutMs?: number;
}

export interface IApproachResultResponse<TData = any> {
    isSuccess: boolean;
    approach: NetworkDeviceApproachEnum;
    target: {
        ip?: string;
        mac?: string;
        subnet?: string;
    };
    matchedCredential?: IDeviceCredential;
    data?: TData;
    responseTimeMs: number;
    errorMessage?: string;
}
```

---

### 5. `[NEW]` `src/app/(root)/tool/network-device/constants/index.ts`
> **Action**: Định nghĩa mapping hiển thị màu sắc, nhãn, icon cho Device Type và Scan Status.

```typescript
import { NetworkDeviceApproachEnum, NetworkDeviceType, NetworkScanStatus } from '../enums';

export const DEVICE_TYPE_CONFIG: Record<
    NetworkDeviceType,
    { label: string; icon: string; color: string }
> = {
    [NetworkDeviceType.CAMERA]: {
        label: 'Camera IP / ONVIF',
        icon: 'noto:videocassette',
        color: 'blue',
    },
    [NetworkDeviceType.ROUTER_AP]: {
        label: 'Router / AP Wi-Fi',
        icon: 'noto:satellite-antenna',
        color: 'cyan',
    },
    [NetworkDeviceType.COMPUTER_PHONE]: {
        label: 'Máy tính / Điện thoại',
        icon: 'noto:laptop',
        color: 'geekblue',
    },
    [NetworkDeviceType.SMART_IOT]: {
        label: 'Thiết bị Smart IoT',
        icon: 'noto:light-bulb',
        color: 'gold',
    },
    [NetworkDeviceType.PRINTER]: {
        label: 'Máy in / Scan',
        icon: 'noto:printer',
        color: 'purple',
    },
    [NetworkDeviceType.UNKNOWN]: {
        label: 'Chưa phân loại',
        icon: 'noto:question-mark',
        color: 'default',
    },
};

export const APPROACH_CONFIG: Record<
    NetworkDeviceApproachEnum,
    { label: string; description: string }
> = {
    [NetworkDeviceApproachEnum.NETWORK_DISCOVERY]: {
        label: 'Khám phá Subnet (NETWORK_DISCOVERY)',
        description: 'Quét toàn dải IP qua ONVIF probe và ARP scanner',
    },
    [NetworkDeviceApproachEnum.PORT_SCAN]: {
        label: 'Quét Cổng Dịch Vụ (PORT_SCAN)',
        description: 'Kiểm tra trạng thái mở của các cổng TCP mục tiêu',
    },
    [NetworkDeviceApproachEnum.PROTOCOL_AUTH]: {
        label: 'Xác Thực Giao Thức (PROTOCOL_AUTH)',
        description: 'Xác thực tài khoản và trích xuất thông số ONVIF/RTSP',
    },
};

export const SCAN_STATUS_CONFIG: Record<
    NetworkScanStatus,
    { label: string; status: 'default' | 'processing' | 'success' | 'error'; color: string }
> = {
    [NetworkScanStatus.IDLE]: {
        label: 'Sẵn sàng',
        status: 'default',
        color: 'default',
    },
    [NetworkScanStatus.SCANNING]: {
        label: 'Đang quét mạng...',
        status: 'processing',
        color: 'processing',
    },
    [NetworkScanStatus.COMPLETED]: {
        label: 'Quét hoàn tất',
        status: 'success',
        color: 'success',
    },
    [NetworkScanStatus.FAILED]: {
        label: 'Quét thất bại',
        status: 'error',
        color: 'error',
    },
};
```

---

### 6. `[NEW]` `src/app/(root)/tool/network-device/hooks.ts`
> **Action**: Quản lý state, polling trạng thái quét và mutation thực thi cho toàn trang.

```typescript
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
                const status = (query.state.data as any)?.data?.status || (query.state.data as any)?.status;
                return status === NetworkScanStatus.SCANNING ? 2500 : false;
            },
        },
    });

    const currentScanStatus = scanStatusData || {
        status: NetworkScanStatus.IDLE,
        devicesDiscoveredCount: 0,
    };

    // 3. Trigger Scan Mutation
    const { mutateAsync: triggerScan, isPending: isTriggeringScan } = useCustomMutationData<
        { message: string },
        ITriggerScanRequest
    >({
        url: API_ENDPOINT.NETWORK_DEVICES.SCAN,
        method: 'post',
        successMessage: 'Đã kích hoạt quét mạng bất đồng bộ thành công',
    });

    // 4. Execute Approach Mutation
    const { mutateAsync: executeApproach, isPending: isExecutingApproach } = useCustomMutationData<
        IApproachResultResponse,
        IExecuteApproachRequest
    >({
        url: API_ENDPOINT.NETWORK_DEVICES.APPROACH_EXECUTE,
        method: 'post',
        successMessage: 'Thực thi chẩn đoán hoàn tất',
    });

    // 5. Modals & Drawer State
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [selectedDeviceForDetail, setSelectedDeviceForDetail] = useState<INetworkDevice | null>(null);
    const [selectedDeviceForApproach, setSelectedDeviceForApproach] = useState<INetworkDevice | null>(null);
    const [approachResult, setApproachResult] = useState<IApproachResultResponse | null>(null);

    // 6. Action Handlers
    const handleTriggerScan = useCallback(
        async (values: ITriggerScanRequest) => {
            await triggerScan(values);
            setIsScanModalOpen(false);
            await scanStatusQuery.refetch();
        },
        [triggerScan, scanStatusQuery],
    );

    const handleExecuteApproach = useCallback(
        async (payload: IExecuteApproachRequest) => {
            setApproachResult(null);
            const res = await executeApproach(payload);
            setApproachResult(res);
        },
        [executeApproach],
    );

    const handleOpenApproachFromDetail = useCallback((device: INetworkDevice) => {
        setSelectedDeviceForDetail(null);
        setSelectedDeviceForApproach(device);
    }, []);

    // 7. Computed Stats
    const stats = useMemo(() => {
        const devices = (tableProps?.dataSource as INetworkDevice[]) || [];
        const total = tableProps?.pagination ? (tableProps.pagination as any).total || devices.length : devices.length;
        const onlineCount = devices.filter((d) => d.isOnline).length;
        const cameraCount = devices.filter((d) => d.deviceType === NetworkDeviceType.CAMERA).length;
        const routerCount = devices.filter((d) => d.deviceType === NetworkDeviceType.ROUTER_AP).length;
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
```

---

### 7. `[NEW]` `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx`
> **Action**: Component hiển thị các thẻ đếm thống kê và Alert Banner tiến trình quét mạng.

```typescript
'use client';

import {
    CustomAlert,
    CustomBadge,
    CustomCard,
    CustomCol,
    CustomFlex,
    CustomRow,
    CustomSpace,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import React from 'react';
import { SCAN_STATUS_CONFIG } from '../constants';
import { NetworkScanStatus } from '../enums';
import { IScanStatusResponse } from '../types';

const { Text, Title } = CustomTypography;

type NetworkDeviceStatsHeaderProps = {
    stats: {
        total: number;
        onlineCount: number;
        cameraCount: number;
        routerCount: number;
        iotCount: number;
    };
    scanStatus: IScanStatusResponse;
};

export const NetworkDeviceStatsHeader: React.FC<NetworkDeviceStatsHeaderProps> = ({
    stats,
    scanStatus,
}) => {
    const isScanning = scanStatus.status === NetworkScanStatus.SCANNING;
    const statusCfg = SCAN_STATUS_CONFIG[scanStatus.status] || SCAN_STATUS_CONFIG[NetworkScanStatus.IDLE];

    return (
        <CustomSpace direction="vertical" size="middle" className="w-full">
            {/* Live Scan Alert Banner */}
            {scanStatus.status !== NetworkScanStatus.IDLE && (
                <CustomAlert
                    type={
                        scanStatus.status === NetworkScanStatus.SCANNING
                            ? 'info'
                            : scanStatus.status === NetworkScanStatus.COMPLETED
                              ? 'success'
                              : 'error'
                    }
                    showIcon
                    icon={
                        isScanning ? (
                            <Icon icon="mdi:loading" className="animate-spin text-lg" />
                        ) : undefined
                    }
                    message={
                        <CustomFlex justify="space-between" align="center" wrap="wrap" gap="small">
                            <CustomSpace>
                                <Text strong>Tiến trình quét mạng:</Text>
                                <CustomBadge status={statusCfg.status} text={statusCfg.label} />
                                {scanStatus.devicesDiscoveredCount > 0 && (
                                    <Text type="secondary">
                                        (Đã phát hiện: {scanStatus.devicesDiscoveredCount} thiết bị)
                                    </Text>
                                )}
                            </CustomSpace>
                            {scanStatus.startedAt && (
                                <Text type="secondary" className="text-xs">
                                    Bắt đầu lúc: {new Date(scanStatus.startedAt).toLocaleTimeString()}
                                </Text>
                            )}
                        </CustomFlex>
                    }
                />
            )}

            {/* Quick Summary Cards */}
            <CustomRow gutter={[16, 16]}>
                <CustomCol xs={12} sm={8} md={4} lg={4}>
                    <CustomCard size="small" className="!bg-slate-50 dark:!bg-slate-900 border-slate-200">
                        <Text type="secondary" className="text-xs block mb-1">
                            Tổng thiết bị
                        </Text>
                        <Title level={4} className="!mb-0 !text-blue-600">
                            {stats.total}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard size="small" className="!bg-emerald-50 dark:!bg-emerald-950/20 border-emerald-200">
                        <Text type="secondary" className="text-xs block mb-1">
                            Đang trực tuyến (Online)
                        </Text>
                        <Title level={4} className="!mb-0 !text-emerald-600">
                            {stats.onlineCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard size="small" className="!bg-sky-50 dark:!bg-sky-950/20 border-sky-200">
                        <Text type="secondary" className="text-xs block mb-1">
                            📹 Camera IP / ONVIF
                        </Text>
                        <Title level={4} className="!mb-0 !text-sky-600">
                            {stats.cameraCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard size="small" className="!bg-cyan-50 dark:!bg-cyan-950/20 border-cyan-200">
                        <Text type="secondary" className="text-xs block mb-1">
                            📡 Router / AP Wi-Fi
                        </Text>
                        <Title level={4} className="!mb-0 !text-cyan-600">
                            {stats.routerCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
                <CustomCol xs={12} sm={8} md={5} lg={5}>
                    <CustomCard size="small" className="!bg-amber-50 dark:!bg-amber-950/20 border-amber-200">
                        <Text type="secondary" className="text-xs block mb-1">
                            💡 Smart IoT
                        </Text>
                        <Title level={4} className="!mb-0 !text-amber-600">
                            {stats.iotCount}
                        </Title>
                    </CustomCard>
                </CustomCol>
            </CustomRow>
        </CustomSpace>
    );
};
```

---

### 8. `[NEW]` `src/app/(root)/tool/network-device/components/NetworkScanModal.tsx`
> **Action**: Modal cấu hình subnet và timeout trước khi kích hoạt quét mạng.

```typescript
'use client';

import {
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
} from '@/components/custom-antd';
import React from 'react';
import { ITriggerScanRequest } from '../types';

type NetworkScanModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: ITriggerScanRequest) => Promise<void>;
    loading: boolean;
};

export const NetworkScanModal: React.FC<NetworkScanModalProps> = ({
    open,
    onClose,
    onSubmit,
    loading,
}) => {
    const [form] = CustomForm.useForm<ITriggerScanRequest>();

    const handleOk = async () => {
        const values = await form.validateFields();
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <CustomModal
            title="🔍 Kích hoạt Quét Mạng LAN"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
            okText="Bắt đầu quét"
            cancelText="Hủy"
        >
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    probeTimeoutMs: 3000,
                }}
            >
                <CustomForm.Item
                    name="subnet"
                    label="Dải mạng Subnet (Tùy chọn)"
                    tooltip="Ví dụ: 192.168.1. Nếu để trống, hệ thống sẽ tự động phát hiện theo địa chỉ IP của card mạng server."
                >
                    <CustomInput placeholder="Để trống để tự động nhận diện (vd: 192.168.1)" />
                </CustomForm.Item>

                <CustomForm.Item
                    name="probeTimeoutMs"
                    label="Thời gian chờ phản hồi UDP probe (ms)"
                    rules={[{ required: true, message: 'Vui lòng nhập timeout' }]}
                >
                    <CustomInputNumber min={1000} max={10000} step={500} className="w-full" />
                </CustomForm.Item>
            </CustomForm>
        </CustomModal>
    );
};
```

---

### 9. `[NEW]` `src/app/(root)/tool/network-device/components/DeviceDetailModal.tsx`
> **Action**: Modal hiển thị chi tiết phần cứng, danh sách open ports, và ONVIF Stream Profiles kèm nút copy URL 1-click.

```typescript
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
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { message } from 'antd';
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
        message.success(`Đã sao chép ${label}`);
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
                        {device.firmwareVersion || onvif?.deviceInformation?.firmwareVersion || 'Chưa xác định'}
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
                                    <CustomCard key={idx} size="small" className="bg-slate-50 dark:bg-slate-900">
                                        <CustomFlex justify="space-between" align="center" className="mb-2">
                                            <Text strong className="text-blue-600">
                                                [{p.name || p.token}] {p.videoEncoding || 'H.264'}
                                                {p.resolution && ` - ${p.resolution.width}x${p.resolution.height}`}
                                                {p.frameRateLimit && ` @ ${p.frameRateLimit}fps`}
                                            </Text>
                                        </CustomFlex>
                                        {p.streamUri && (
                                            <CustomFlex justify="space-between" align="center" gap="small" className="mb-1">
                                                <Text className="text-xs break-all" type="secondary">
                                                    RTSP: {p.streamUri}
                                                </Text>
                                                <CustomButton
                                                    size="small"
                                                    type="text"
                                                    icon={<Icon icon="mdi:content-copy" />}
                                                    onClick={() => handleCopy(p.streamUri!, 'RTSP URL')}
                                                >
                                                    Copy
                                                </CustomButton>
                                            </CustomFlex>
                                        )}
                                        {p.snapshotUri && (
                                            <CustomFlex justify="space-between" align="center" gap="small">
                                                <Text className="text-xs break-all" type="secondary">
                                                    Snapshot: {p.snapshotUri}
                                                </Text>
                                                <CustomButton
                                                    size="small"
                                                    type="text"
                                                    icon={<Icon icon="mdi:content-copy" />}
                                                    onClick={() => handleCopy(p.snapshotUri!, 'Snapshot URL')}
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
```

---

### 10. `[NEW]` `src/app/(root)/tool/network-device/components/DeviceApproachDrawer.tsx`
> **Action**: Drawer chẩn đoán và thực thi kiểm thử Approach (`PORT_SCAN`, `PROTOCOL_AUTH`, `NETWORK_DISCOVERY`).

```typescript
'use client';

import {
    CustomAlert,
    CustomButton,
    CustomCard,
    CustomDrawer,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRadio,
    CustomSelect,
    CustomSpace,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import React, { useEffect } from 'react';
import { APPROACH_CONFIG } from '../constants';
import { NetworkDeviceApproachEnum } from '../enums';
import {
    IApproachResultResponse,
    IExecuteApproachRequest,
    INetworkDevice,
} from '../types';

const { Text } = CustomTypography;

type DeviceApproachDrawerProps = {
    device: INetworkDevice | null;
    open: boolean;
    onClose: () => void;
    onExecute: (payload: IExecuteApproachRequest) => Promise<void>;
    result: IApproachResultResponse | null;
    loading: boolean;
};

export const DeviceApproachDrawer: React.FC<DeviceApproachDrawerProps> = ({
    device,
    open,
    onClose,
    onExecute,
    result,
    loading,
}) => {
    const [form] = CustomForm.useForm<IExecuteApproachRequest>();
    const currentApproach = CustomForm.useWatch('approach', form);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
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
        }
    }, [open, device, form]);

    const handleSubmit = async () => {
        const values = await form.validateFields();
        await onExecute(values);
    };

    return (
        <CustomDrawer
            title={
                <CustomFlex align="center" gap="small">
                    <Icon icon="mdi:flash" width={22} height={22} className="text-amber-500" />
                    <span>Chẩn Đoán & Tiếp Cận Thiết Bị</span>
                </CustomFlex>
            }
            open={open}
            onClose={onClose}
            width={580}
            footer={
                <CustomFlex justify="flex-end" gap="small">
                    <CustomButton onClick={onClose}>Đóng</CustomButton>
                    <CustomButton
                        type="primary"
                        icon={<Icon icon="mdi:play" />}
                        onClick={handleSubmit}
                        loading={loading}
                    >
                        Bắt Đầu Thực Thi
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomForm form={form} layout="vertical">
                <CustomForm.Item
                    name="approach"
                    label="Phương thức tiếp cận (Approach Type)"
                    rules={[{ required: true }]}
                >
                    <CustomRadio.Group className="w-full">
                        <CustomSpace direction="vertical" className="w-full">
                            {Object.entries(APPROACH_CONFIG).map(([key, cfg]) => (
                                <CustomRadio key={key} value={key}>
                                    <span className="font-semibold">{cfg.label}</span>
                                    <div className="text-xs text-slate-500">{cfg.description}</div>
                                </CustomRadio>
                            ))}
                        </CustomSpace>
                    </CustomRadio.Group>
                </CustomForm.Item>

                <CustomForm.Item
                    name="ip"
                    label="Địa chỉ IP mục tiêu"
                    rules={[{ required: currentApproach !== NetworkDeviceApproachEnum.NETWORK_DISCOVERY }]}
                >
                    <CustomInput placeholder="vd: 192.168.1.100" />
                </CustomForm.Item>

                {currentApproach === NetworkDeviceApproachEnum.PORT_SCAN && (
                    <CustomForm.Item
                        name="ports"
                        label="Danh sách cổng TCP cần kiểm tra"
                        tooltip="Nhập các cổng TCP và nhấn Enter để thêm"
                    >
                        <CustomSelect
                            mode="tags"
                            placeholder="vd: 80, 554, 8000, 37777"
                            className="w-full"
                        />
                    </CustomForm.Item>
                )}

                {currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH && (
                    <div>
                        <Text strong className="block mb-2 text-xs">
                            Danh sách Tài khoản Xác thực (Credentials):
                        </Text>
                        <CustomForm.List name="credentials">
                            {(fields, { add, remove }) => (
                                <CustomSpace direction="vertical" className="w-full">
                                    {fields.map(({ key, name, ...restField }) => (
                                        <CustomFlex key={key} gap="small" align="center">
                                            <CustomForm.Item
                                                {...restField}
                                                name={[name, 'username']}
                                                className="!mb-0 flex-1"
                                                rules={[{ required: true, message: 'Nhập username' }]}
                                            >
                                                <CustomInput placeholder="Username" />
                                            </CustomForm.Item>
                                            <CustomForm.Item
                                                {...restField}
                                                name={[name, 'password']}
                                                className="!mb-0 flex-1"
                                            >
                                                <CustomInput.Password placeholder="Password (để trống nếu ko có)" />
                                            </CustomForm.Item>
                                            <CustomButton
                                                danger
                                                type="text"
                                                icon={<Icon icon="mdi:delete" />}
                                                onClick={() => remove(name)}
                                            />
                                        </CustomFlex>
                                    ))}
                                    <CustomButton
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<Icon icon="mdi:plus" />}
                                    >
                                        Thêm Credential
                                    </CustomButton>
                                </CustomSpace>
                            )}
                        </CustomForm.List>
                    </div>
                )}

                <CustomForm.Item name="timeoutMs" label="Thời gian Timeout (ms)" className="mt-4">
                    <CustomInputNumber min={500} max={30000} step={500} className="w-full" />
                </CustomForm.Item>
            </CustomForm>

            {/* Execution Result Box */}
            {result && (
                <CustomCard
                    size="small"
                    className="mt-4 border-slate-200"
                    title={
                        <CustomFlex justify="space-between" align="center">
                            <Text strong>📋 Kết quả thực thi</Text>
                            <CustomTag color={result.isSuccess ? 'success' : 'error'}>
                                {result.isSuccess ? 'THÀNH CÔNG' : 'THẤT BÀI'} ({result.responseTimeMs}ms)
                            </CustomTag>
                        </CustomFlex>
                    }
                >
                    {result.errorMessage && (
                        <CustomAlert
                            type="error"
                            showIcon
                            message={result.errorMessage}
                            className="mb-2 text-xs"
                        />
                    )}

                    {result.matchedCredential && (
                        <div className="mb-2 p-2 bg-emerald-50 rounded border border-emerald-200 text-xs">
                            <Text strong className="text-emerald-700">
                                🔑 Tài khoản xác thực khớp: {result.matchedCredential.username} /{' '}
                                {result.matchedCredential.password || '(trống)'}
                            </Text>
                        </div>
                    )}

                    {result.data && (
                        <div>
                            <Text type="secondary" className="text-xs block mb-1">
                                Payload phản hồi (JSON):
                            </Text>
                            <pre className="p-2 bg-slate-900 text-slate-100 rounded text-xs overflow-x-auto max-h-60">
                                {JSON.stringify(result.data, null, 2)}
                            </pre>
                        </div>
                    )}
                </CustomCard>
            )}
        </CustomDrawer>
    );
};
```

---

### 11. `[NEW]` `src/app/(root)/tool/network-device/components/index.ts`
> **Action**: Barrel export cho các components trong module.

```typescript
export * from './DeviceApproachDrawer';
export * from './DeviceDetailModal';
export * from './NetworkDeviceStatsHeader';
export * from './NetworkScanModal';
```

---

### 12. `[NEW]` `src/app/(root)/tool/network-device/page.tsx`
> **Action**: Lắp ghép toàn bộ components và hooks với cấu trúc chuẩn `ListWrapper` + `FilterPanel` + `ListTable`.

```typescript
'use client';

import {
    FilterPanel,
    ListTable,
    ListWrapper,
    type CardAction,
    type FilterField,
} from '@/components/common';
import {
    CustomBadge,
    CustomFlex,
    CustomSpace,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { Icon } from '@iconify/react';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo } from 'react';
import {
    DeviceApproachDrawer,
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
                        <Text className="text-xs font-mono block">
                            {record.macAddress || '—'}
                        </Text>
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
                        return <Text type="secondary" className="text-xs">—</Text>;
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
    const filters: FilterField[] = useMemo(
        () => [
            {
                name: 'search',
                type: 'input',
                placeholder: 'Tìm IP, MAC, Vendor...',
                onSearch: (val) => debouncedSearch(val),
            },
            {
                name: 'deviceType',
                type: 'select',
                placeholder: 'Loại thiết bị',
                options: Object.entries(DEVICE_TYPE_CONFIG).map(([key, cfg]) => ({
                    label: cfg.label,
                    value: key,
                })),
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'deviceType',
                            operator: 'eq',
                            value: val,
                        },
                    ]),
            },
            {
                name: 'isOnline',
                type: 'select',
                placeholder: 'Trạng thái',
                options: [
                    { label: '🟢 Online', value: 'true' },
                    { label: '⚪ Offline', value: 'false' },
                ],
                onChange: (val) =>
                    setFilters([
                        {
                            field: 'isOnline',
                            operator: 'eq',
                            value: val === undefined ? undefined : val === 'true',
                        },
                    ]),
            },
        ],
        [debouncedSearch, setFilters],
    );

    // 3. Actions for ListWrapper Header
    const actions: CardAction[] = useMemo(
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
                        <Icon icon="mdi:refresh" className={tableQuery.isFetching ? 'animate-spin' : ''} />
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
                error={tableQuery.error}
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
                            icon: <Icon icon="mdi:flash" className="text-amber-500 text-base" />,
                            onClick: (record) => setSelectedDeviceForApproach(record),
                        },
                    ]}
                />
            </ListWrapper>

            <NetworkScanModal
                open={isScanModalOpen}
                onClose={() => setIsScanModalOpen(false)}
                onSubmit={handleTriggerScan}
                loading={isTriggeringScan}
            />

            <DeviceDetailModal
                device={selectedDeviceForDetail}
                open={Boolean(selectedDeviceForDetail)}
                onClose={() => setSelectedDeviceForDetail(null)}
                onOpenApproach={handleOpenApproachFromDetail}
            />

            <DeviceApproachDrawer
                device={selectedDeviceForApproach}
                open={Boolean(selectedDeviceForApproach)}
                onClose={() => setSelectedDeviceForApproach(null)}
                onExecute={handleExecuteApproach}
                result={approachResult}
                loading={isExecutingApproach}
            />
        </CustomSpace>
    );
}
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- `npx prettier --write "src/app/(root)/tool/network-device/**"`: **PASS** (Tất cả 10 tệp mã nguồn tuân thủ Prettier format)
- `npx eslint src/app/(root)/tool/network-device/**`: **PASS** (0 errors, 0 warnings)
- `npm run build`: **PASS** (Next.js 16.3.0 Turbopack build thành công, sinh route `/tool/network-device` hoàn chỉnh)

### Manual Checks
1. Truy cập route: `http://localhost:3000/tool/network-device` (hoặc click menu "Công cụ" $\rightarrow$ "Thiết bị mạng" trên Sidebar).
2. Kiểm tra `<ListWrapper />` hiển thị đồng bộ với toàn bộ hệ thống: FilterPanel bên trái (Search IP, Select Type, Select Status), Actions bên phải ("Làm mới", "Quét Mạng Mới").
3. Bảng `<ListTable />` hiển thị đầy đủ icon mắt `onView` (mở `DeviceDetailModal`), icon `mdi:flash` trong `customRowActions` (mở `DeviceApproachDrawer`), và tự động xử lý xóa thiết bị (`deleteResource`).
4. Bấm **"Quét Mạng Mới"**, nhập timeout và submit $\rightarrow$ Banner hiển thị `SCANNING`, tự động polling `status` cho đến khi `COMPLETED` và làm mới danh sách thiết bị.
5. Bấm icon **👁️ Xem Chi Tiết** $\rightarrow$ Modal mở hiển thị thông tin phần cứng và profiles ONVIF, test nút **Copy** RTSP URL.
