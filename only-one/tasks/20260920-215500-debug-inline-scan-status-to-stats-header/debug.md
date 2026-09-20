---
status: fixed
slug: inline-scan-status-to-stats-header
started_at: 2026-09-20 21:55:00
completed_at: 2026-09-20 21:56:45
reproduction_test: npx tsc --noEmit
---

# Debug: Gom useNetworkScanStatus trực tiếp vào NetworkDeviceStatsHeader & Xóa Hook Thừa

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Lỗi**: Khi gom logic từ `useNetworkScanStatus` vào [NetworkDeviceStatsHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx), biến `currentScanStatus` và `stats` bị thiếu định nghĩa khiến TypeScript báo lỗi (`Cannot find name 'currentScanStatus'`, `Cannot find name 'stats'`). Đồng thời, file [useNetworkScanStatus.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/hooks/useNetworkScanStatus.ts) trở thành orphaned file không còn nơi nào sử dụng.
- **Red Test Case**: Chạy kiểm tra TypeScript compiler trên FE:
  ```bash
  npx tsc --noEmit
  ```
- **Lệnh chạy tái hiện**: `npx tsc --noEmit`

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - Trong [NetworkDeviceStatsHeader.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx), sau khi chuyển `useCustomData<IScanStatusResponse>` vào bên trong component, fallback object cho `currentScanStatus` (`scanStatusData || { status: NetworkScanStatus.IDLE, devicesDiscoveredCount: 0 }`) và `stats` (`statsData ?? { total: 0, onlineCount: 0, cameraCount: 0, routerCount: 0, iotCount: 0 }`) bị khuyết.
  - File [useNetworkScanStatus.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/hooks/useNetworkScanStatus.ts) là hook đơn mục đích chỉ phục vụ duy nhất header này. Việc tách riêng tạo thêm tầng indirection không cần thiết.
- **Invariants bị vi phạm & Cần bảo toàn**:
  - `alertConfig` phải luôn nhận `currentScanStatus` hợp lệ (kể cả khi query đang loading/idle).
  - `statCards` phải luôn nhận `stats` hợp lệ với giá trị mặc định là 0.
  - Barrel export `hooks/index.ts` chỉ export các hook thực sự còn tồn tại (`useNetworkDeviceModals`).

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi**:
  1. Hoàn thiện inlining trực tiếp trong `NetworkDeviceStatsHeader.tsx`: khai báo `currentScanStatus` và `stats` an toàn từ `scanStatusData` và `statsData`.
  2. Xóa bỏ file `hooks/useNetworkScanStatus.ts`.
  3. Xóa export của `useNetworkScanStatus` trong `hooks/index.ts`.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/app/(root)/tool/network-device/
├── components/
│   └── [MODIFY] NetworkDeviceStatsHeader.tsx    # Bổ sung khai báo fallback currentScanStatus & stats
├── hooks/
│   ├── [DELETE] useNetworkScanStatus.ts         # Xóa hook đã được gom vào header
│   └── [MODIFY] index.ts                        # Prune export useNetworkScanStatus
```

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx` | `NetworkDeviceStatsHeader` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[DELETE]` | `src/app/(root)/tool/network-device/hooks/useNetworkScanStatus.ts` | Whole file | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/hooks/index.ts` | Barrel export | `Order 2` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/app/(root)/tool/network-device/components/NetworkDeviceStatsHeader.tsx`
- **Mục đích thay đổi**: Khai báo đầy đủ fallback cho `currentScanStatus` và `stats` từ kết quả của các hooks `useCustomData`.
- **Điểm can thiệp (AST Seams)**: `NetworkDeviceStatsHeader` body.

```diff
@@ -27,7 +27,7 @@
 export const NetworkDeviceStatsHeader = ({ className }: NetworkDeviceStatsHeaderProps = {}) => {
-    const { data: scanStatusData, query: scanStatusQuery } = useCustomData<IScanStatusResponse>({
+    const { data: scanStatusData } = useCustomData<IScanStatusResponse>({
         method: 'get',
         url: API_ENDPOINT.NETWORK_DEVICES.SCAN_STATUS,
         queryOptions: {
             refetchInterval: (query) => {
                 const responseData = query.state.data?.data;
                 const unwrapped = unwrapApiResponse<IScanStatusResponse>(responseData);
                 const status = unwrapped?.status ?? responseData?.status;
                 return status === NetworkScanStatus.SCANNING ? 2500 : false;
             },
         },
     });
 
     const { data: statsData } = useCustomData<INetworkDeviceStats>({
         url: API_ENDPOINT.NETWORK_DEVICES.STATS,
     });
+
+    const currentScanStatus = scanStatusData || {
+        status: NetworkScanStatus.IDLE,
+        devicesDiscoveredCount: 0,
+    };
+
+    const stats = statsData ?? {
+        total: 0,
+        onlineCount: 0,
+        cameraCount: 0,
+        routerCount: 0,
+        iotCount: 0,
+    };
```

---

### 2. `[DELETE]` `src/app/(root)/tool/network-device/hooks/useNetworkScanStatus.ts`
- **Mục đích thay đổi**: Xóa file hook thừa sau khi đã gom trọn vẹn vào `NetworkDeviceStatsHeader.tsx`.

---

### 3. `[MODIFY]` `src/app/(root)/tool/network-device/hooks/index.ts`
- **Mục đích thay đổi**: Prune export `useNetworkScanStatus`.

```diff
@@ -1,2 +1 @@
 export * from './useNetworkDeviceModals';
-export * from './useNetworkScanStatus';
```

---

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[ ]` `npx tsc --noEmit`: `PENDING -> PASS (0 errors)`
  - `[ ]` `npx eslint "src/app/(root)/tool/network-device/"`: `PENDING -> PASS (0 errors)`
- **Bài học kinh nghiệm**:
  - Khi inline hook vào component, đảm bảo các biến phái sinh (`currentScanStatus`, `stats`) có fallback an toàn để tránh compile error.
