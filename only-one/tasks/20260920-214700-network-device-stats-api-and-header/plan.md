---
status: done
slug: network-device-stats-api-and-header
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Triển khai Endpoint Thống Kê Thiết Bị Mạng & Cập Nhật Stats Header Độc Lập

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Điểm nghẽn kỹ thuật**: Hiện tại [NetworkDeviceStatsHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx) đang nhận prop `table: UseCustomTableResponse<INetworkDevice>` và tự tính các chỉ số (`total`, `onlineCount`, `cameraCount`, `routerCount`, `iotCount`) trực tiếp từ `table.tableProps.dataSource`.
- **Hạn chế nghiêm trọng**: `dataSource` chỉ chứa các bản ghi của **trang phân trang hiện tại** (ví dụ 10 bản ghi). Khi tổng số thiết bị trong database vượt quá kích thước 1 trang hoặc khi người dùng thực hiện lọc dữ liệu trên bảng, các thẻ thống kê tổng quan sẽ hiển thị số liệu sai lệch hoàn toàn so với thực tế toàn hệ thống.
- **Invariants bảo toàn**:
  - Không phá vỡ giao diện trực quan 5 cards thống kê (`Tổng thiết bị`, `Đang trực tuyến`, `Camera IP`, `Router / AP Wi-Fi`, `Smart IoT`).
  - Bảo lưu tính năng hiển thị Alert banner tiến trình quét mạng (`useNetworkScanStatus`).
  - Tuân thủ quy tắc kiến trúc `only-one`: Base DTO decorators (`@NumberField`), API endpoint config centralized (`API_ENDPOINT`), custom hooks (`useCustomData`), và chuẩn hóa import component.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Backend Contracts & DTOs (`only-one-be`)
- **DTO**: `NetworkDeviceStatsResponseDto` khai báo trong `src/modules/network-device/dtos/responses/network-device-stats-response.dto.ts`:
  ```ts
  export class NetworkDeviceStatsResponseDto {
      @NumberField()
      total: number;

      @NumberField()
      onlineCount: number;

      @NumberField()
      cameraCount: number;

      @NumberField()
      routerCount: number;

      @NumberField()
      iotCount: number;
  }
  ```
- **Service Method**: `NetworkDeviceService.getStats(): Promise<NetworkDeviceStatsResponseDto>` thực hiện count song song (`Promise.all`) trên `networkDeviceRepo` theo các tiêu chí:
  - `total`: tổng số bản ghi trong bảng `network_devices`.
  - `onlineCount`: điều kiện `isOnline: true`.
  - `cameraCount`: điều kiện `deviceType: NetworkDeviceType.CAMERA`.
  - `routerCount`: điều kiện `deviceType: NetworkDeviceType.ROUTER_AP`.
  - `iotCount`: điều kiện `deviceType: NetworkDeviceType.SMART_IOT`.
- **Controller Route**: `NetworkDeviceController` đăng ký endpoint `@Get({ path: 'stats', summary: 'Get network device summary statistics', responseDto: NetworkDeviceStatsResponseDto })`.

### 2.2 Frontend Contracts & Hooks (`only-one-fe`)
- **Endpoint Config**: Bổ sung `STATS: prefix('network-devices/stats')` vào `API_ENDPOINT.NETWORK_DEVICES` trong `src/config/endpoint.ts`.
- **Type Contract**: Khai báo interface `INetworkDeviceStats` trong `src/app/(root)/tool/network-device/types/network-device.types.ts`:
  ```ts
  export interface INetworkDeviceStats {
      total: number;
      onlineCount: number;
      cameraCount: number;
      routerCount: number;
      iotCount: number;
  }
  ```
- **AST Seams**:
  - `NetworkDeviceStatsHeader.tsx`: Loại bỏ prop `table`, sử dụng hook `useCustomData<INetworkDeviceStats>({ url: API_ENDPOINT.NETWORK_DEVICES.STATS })` để fetch dữ liệu thống kê từ server.
  - `page.tsx`: Cập nhật vị trí render `<NetworkDeviceStatsHeader />` trong `top` slot của `ListContainer` mà không cần truyền `table`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
only-one-be/src/modules/network-device/
├── controllers/
│   └── [MODIFY] network-device.controller.ts                         # Thêm route GET /network-devices/stats
├── dtos/
│   ├── responses/
│   │   ├── [NEW]    network-device-stats-response.dto.ts             # DTO response thống kê
│   │   └── [MODIFY] index.ts                                         # Re-export NetworkDeviceStatsResponseDto
│   └── [MODIFY] index.ts                                             # Re-export DTO
└── services/
    └── [MODIFY] network-device.service.ts                            # Thêm hàm getStats() tính toán số liệu tổng

only-one-fe/
├── src/config/
│   └── [MODIFY] endpoint.ts                                          # Thêm API_ENDPOINT.NETWORK_DEVICES.STATS
└── src/app/(root)/tool/network-device/
    ├── types/
    │   └── [MODIFY] network-device.types.ts                          # Thêm interface INetworkDeviceStats
    ├── components/
    │   └── [MODIFY] NetworkDeviceStatsHeader.tsx                     # Dùng useCustomData fetch stats độc lập
    └── [MODIFY] page.tsx                                             # Cập nhật gọi <NetworkDeviceStatsHeader />
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `only-one-be/src/modules/network-device/dtos/responses/network-device-stats-response.dto.ts` | `NetworkDeviceStatsResponseDto` | `None` | `npm run build` (BE) |
| **2** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/network-device/dtos/responses/index.ts` | Barrel exports | `Order 1` | `npm run build` (BE) |
| **3** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/network-device/services/network-device.service.ts` | `NetworkDeviceService.getStats` | `Order 1` | `npm run build` (BE) |
| **4** | `[x]` | `[MODIFY]` | `only-one-be/src/modules/network-device/controllers/network-device.controller.ts` | `NetworkDeviceController.getStats` | `Order 2, 3` | `npm run build` (BE) |
| **5** | `[x]` | `[MODIFY]` | `only-one-fe/src/config/endpoint.ts` | `API_ENDPOINT.NETWORK_DEVICES.STATS` | `None` | `npx tsc --noEmit` (FE) |
| **6** | `[x]` | `[MODIFY]` | `only-one-fe/src/app/(root)/tool/network-device/types/network-device.types.ts` | `INetworkDeviceStats` | `None` | `npx tsc --noEmit` (FE) |
| **7** | `[x]` | `[MODIFY]` | `only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx` | `NetworkDeviceStatsHeader` | `Order 5, 6` | `npx tsc --noEmit` (FE) |
| **8** | `[x]` | `[MODIFY]` | `only-one-fe/src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` JSX top prop | `Order 7` | `npx tsc --noEmit` (FE) |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `only-one-be/src/modules/network-device/dtos/responses/network-device-stats-response.dto.ts`
> **Action**: Khởi tạo DTO response chứa các metric thống kê thiết bị mạng.

```typescript
import { NumberField } from '../../../../decorators';

export class NetworkDeviceStatsResponseDto {
    @NumberField()
    total: number;

    @NumberField()
    onlineCount: number;

    @NumberField()
    cameraCount: number;

    @NumberField()
    routerCount: number;

    @NumberField()
    iotCount: number;

    constructor(data?: Partial<NetworkDeviceStatsResponseDto>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}
```

---

### 2. `[MODIFY]` `only-one-be/src/modules/network-device/dtos/responses/index.ts`
> **Action**: Re-export `NetworkDeviceStatsResponseDto`.

```diff
@@ -1,3 +1,4 @@
 export * from './approach-result-response.dto';
+export * from './network-device-stats-response.dto';
 export * from './scan-status-response.dto';
 export * from './trigger-scan-response.dto';
```

---

### 3. `[MODIFY]` `only-one-be/src/modules/network-device/services/network-device.service.ts`
> **Action**: Bổ sung method `getStats()` tính toán thống kê tổng thể bằng truy vấn `count()` song song.

```diff
@@ -8,4 +8,5 @@
 import { BaseService } from '../../../common/base.service';
 import { NetworkDeviceDto } from '../dtos';
+import { NetworkDeviceStatsResponseDto } from '../dtos/responses';
 import { NetworkDeviceEntity } from '../entities';
 import { NetworkDeviceType } from '../enums';
@@ -21,4 +22,19 @@
     }
 
+    async getStats(): Promise<NetworkDeviceStatsResponseDto> {
+        const [total, onlineCount, cameraCount, routerCount, iotCount] = await Promise.all([
+            this.networkDeviceRepo.count(),
+            this.networkDeviceRepo.count({ where: { isOnline: true } }),
+            this.networkDeviceRepo.count({ where: { deviceType: NetworkDeviceType.CAMERA } }),
+            this.networkDeviceRepo.count({ where: { deviceType: NetworkDeviceType.ROUTER_AP } }),
+            this.networkDeviceRepo.count({ where: { deviceType: NetworkDeviceType.SMART_IOT } }),
+        ]);
+
+        return new NetworkDeviceStatsResponseDto({
+            total,
+            onlineCount,
+            cameraCount,
+            routerCount,
+            iotCount,
+        });
+    }
+
     async upsertNetworkDevice(data: Partial<NetworkDeviceDto>): Promise<NetworkDeviceDto> {
```

---

### 4. `[MODIFY]` `only-one-be/src/modules/network-device/controllers/network-device.controller.ts`
> **Action**: Đăng ký endpoint `GET /network-devices/stats`.

```diff
@@ -4,4 +4,6 @@
 import { BaseController } from '../../../common/base.controller';
-import { Auth } from '../../../decorators';
+import { Auth, Get } from '../../../decorators';
 import { NETWORK_DEVICE_PAGINATION_CONFIG } from '../constants/network-device-pagination.config';
 import { NetworkDeviceDto } from '../dtos';
+import { NetworkDeviceStatsResponseDto } from '../dtos/responses';
 import { NetworkDeviceEntity } from '../entities';
@@ -17,3 +19,12 @@
     }
+
+    @Get({
+        path: 'stats',
+        summary: 'Get network device summary statistics',
+        responseDto: NetworkDeviceStatsResponseDto,
+    })
+    async getStats(): Promise<NetworkDeviceStatsResponseDto> {
+        return await this.networkDeviceService.getStats();
+    }
 }
```

---

### 5. `[MODIFY]` `only-one-fe/src/config/endpoint.ts`
> **Action**: Thêm `STATS` vào endpoint config của `NETWORK_DEVICES`.

```diff
@@ -144,4 +144,5 @@
         BASE: prefix('network-devices'),
         ALL: prefix('network-devices/all'),
         DETAIL: (id: string | number) => prefix(`network-devices/${id}`),
+        STATS: prefix('network-devices/stats'),
         SCAN: prefix('network-devices/scan'),
```

---

### 6. `[MODIFY]` `only-one-fe/src/app/(root)/tool/network-device/types/network-device.types.ts`
> **Action**: Khai báo interface `INetworkDeviceStats`.

```diff
@@ -47,2 +47,10 @@
 }
+
+export interface INetworkDeviceStats {
+    total: number;
+    onlineCount: number;
+    cameraCount: number;
+    routerCount: number;
+    iotCount: number;
+}
```

---

### 7. `[MODIFY]` `only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx`
> **Action**: Chuyển sang dùng `useCustomData<INetworkDeviceStats>` độc lập thay vì tính toán từ `table.dataSource`.

```diff
@@ -10,13 +10,13 @@
     CustomSpace,
     CustomTypography,
 } from '@/components';
-import type { UseCustomTableResponse } from '@/hooks';
+import { API_ENDPOINT } from '@/config';
+import { useCustomData } from '@/hooks';
 
 import { SCAN_STATUS_ALERT_TYPE_MAP, SCAN_STATUS_CONFIG } from '../constants';
-import { NetworkDeviceType, NetworkScanStatus } from '../enums';
+import { NetworkScanStatus } from '../enums';
 import { useNetworkScanStatus } from '../hooks/useNetworkScanStatus';
-import type { INetworkDevice } from '../types';
+import type { INetworkDeviceStats } from '../types';
 
 const { Text, Title } = CustomTypography;
 
-type NetworkDeviceStatsHeaderProps = {
-    table: UseCustomTableResponse<INetworkDevice>;
-};
+type NetworkDeviceStatsHeaderProps = {
+    className?: string;
+};
 
-export const NetworkDeviceStatsHeader = ({ table }: NetworkDeviceStatsHeaderProps) => {
+export const NetworkDeviceStatsHeader = ({ className }: NetworkDeviceStatsHeaderProps = {}) => {
     const { currentScanStatus } = useNetworkScanStatus();
+    const { data: statsData } = useCustomData<INetworkDeviceStats>({
+        url: API_ENDPOINT.NETWORK_DEVICES.STATS,
+    });
 
-    const stats = useMemo(() => {
-        const devices = Array.isArray(table.tableProps?.dataSource)
-            ? (table.tableProps.dataSource as INetworkDevice[])
-            : [];
-        const total = table.tableProps?.pagination
-            ? (table.tableProps.pagination as { total?: number }).total || devices.length
-            : devices.length;
-        const onlineCount = devices.filter((d) => d.isOnline).length;
-        const cameraCount = devices.filter((d) => d.deviceType === NetworkDeviceType.CAMERA).length;
-        const routerCount = devices.filter(
-            (d) => d.deviceType === NetworkDeviceType.ROUTER_AP,
-        ).length;
-        const iotCount = devices.filter((d) => d.deviceType === NetworkDeviceType.SMART_IOT).length;
-
-        return { total, onlineCount, cameraCount, routerCount, iotCount };
-    }, [table.tableProps]);
+    const stats = statsData ?? {
+        total: 0,
+        onlineCount: 0,
+        cameraCount: 0,
+        routerCount: 0,
+        iotCount: 0,
+    };
```

---

### 8. `[MODIFY]` `only-one-fe/src/app/(root)/tool/network-device/page.tsx`
> **Action**: Render `<NetworkDeviceStatsHeader />` gọn gàng trong `top` slot.

```diff
@@ -230,3 +230,3 @@
                 actions={actions}
                 filters={filters}
-                top={<NetworkDeviceStatsHeader table={table} />}
+                top={<NetworkDeviceStatsHeader />}
             >
```

---

## Section 5. Test Cases & Verification
- **Automated Verification**:
  - Backend: `npm run build` trong `only-one-be` $\rightarrow$ đảm bảo compile TypeScript và route registration thành công.
  - Frontend: `npx tsc --noEmit` & `npx eslint` trong `only-one-fe` $\rightarrow$ 0 errors.
- **Manual Verification**:
  - Gọi test endpoint `GET http://localhost:8000/network-devices/stats` $\rightarrow$ nhận JSON `{ total, onlineCount, cameraCount, routerCount, iotCount }`.
  - Mở trang `/tool/network-device` $\rightarrow$ các card thống kê tải đúng số liệu tổng trên toàn DB kể cả khi đổi trang (Pagination) hoặc đổi bộ lọc (Filters).
