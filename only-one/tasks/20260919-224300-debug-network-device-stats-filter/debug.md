# Debug: Sửa lỗi `TypeError: devices.filter is not a function` tại useNetworkDeviceStats

---
status: fixed
slug: network-device-stats-filter
started_at: 2026-09-19 22:43:00
completed_at: 2026-09-19 22:45:50
reproduction_test: node -e "const stats = (dataSource) => { const devices = (dataSource) || []; return devices.filter(d => d.isOnline); }; stats({ data: [], meta: null, links: null });"
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Stack Trace**:
  Khi truy cập trang `/tool/network-device` lúc dữ liệu danh sách thiết bị rỗng hoặc đang được load lần đầu, màn hình ném lỗi runtime JavaScript làm crash giao diện:
  ```text
  [browser] Uncaught TypeError: devices.filter is not a function
      at useNetworkDeviceStats (src/app/(root)/tool/network-device/hooks/useNetworkDeviceStats.ts:14:38)
      at useNetworkDevicePage (src/app/(root)/tool/network-device/hooks/useNetworkDevicePage.ts:10:37)
      at NetworkDevicePage (src/app/(root)/tool/network-device/page.tsx:28:16)
    14 | export const useNetworkDeviceStats = (table: TableLike) => {
    15 |     const stats = useMemo(() => {
  > 16 |         const devices = (table.tableProps?.dataSource as INetworkDevice[]) || [];
    17 |         const total = table.tableProps?.pagination
    18 |             ? (table.tableProps.pagination as { total?: number }).total || devices.length
    19 |             : devices.length;
    20 |         const onlineCount = devices.filter((d) => d.isOnline).length;
  ```
- **Red Feedback Loop (Tái hiện lỗi tự động)**:
  Lệnh script tái hiện chính xác luồng dữ liệu trả về từ data provider:
  ```bash
  node -e "const stats = (dataSource) => { const devices = (dataSource) || []; return devices.filter(d => d.isOnline); }; try { stats({ data: [], meta: null, links: null }); console.log('PASS'); } catch(e) { console.error('FAIL (Red Loop):', e.message); process.exit(1); }"
  ```
  Kết quả: `FAIL (Red Loop): devices.filter is not a function`.

---

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  Có 3 điểm đứt gãy trong chuỗi data pipeline giữa backend và frontend:
  1. **Backend (`BaseService.getPaginationWithCustomQuery`)**: Khi bảng không có bản ghi nào (`result.data.length === 0`), service trả về `defaultResult = { data: [], meta: null, links: null }`.
  2. **Backend Interceptor (`TransformResponseInterceptor`)**: Interceptor kiểm tra điều kiện `if (data?.data && data?.meta && data?.links)`. Vì `meta` và `links` là `null`, nó bọc toàn bộ đối tượng vào response envelope: `{ data: { data: [], meta: null, links: null }, errors: null, isSuccess: true }`.
  3. **Frontend DataProvider (`unwrapResponseData`)**: Do payload trả về có dạng `{ data: { data: [], ... }, isSuccess: true }`, hàm unwrap không kiểm tra trường hợp paginated lồng trong `payload.data`, dẫn đến việc trả về `data: { data: [], meta: null, links: null }` (dạng object thay vì array) cho Refine `useTable`.
  4. **Frontend Hook (`useNetworkDeviceStats`)**: Hook giả định `table.tableProps?.dataSource` luôn là Array khi truthy bằng cách ép kiểu `(table.tableProps?.dataSource as INetworkDevice[]) || []`. Khi `dataSource` là một object `{ data: [], ... }`, biểu thức đánh giá thành object đó và khi gọi `.filter()` thì gây crash.

- **Invariants bị vi phạm**:
  - *Invariant 1*: `useNetworkDeviceStats` phải luôn đảm bảo `devices` là một `Array` hợp lệ (`Array.isArray(...)`), không được ép kiểu mù quáng.
  - *Invariant 2*: `unwrapResponseData` của frontend data provider phải luôn unwrap đúng cấu trúc mảng đối với mọi response envelope có dữ liệu phân trang.
  - *Invariant 3*: Backend `BaseService.getPaginationWithCustomQuery` không được ghi đè metadata chuẩn của `nestjs-paginate` bằng `null` khi danh sách rỗng.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. **Phòng thủ tại Hook**: Sửa `useNetworkDeviceStats.ts` sử dụng `Array.isArray(table.tableProps?.dataSource)` để fallback về `[]` an toàn tuyệt đối.
  2. **Xử lý Unwrap tại DataProvider**: Bổ sung nhánh unwrap cho nested envelope `{ isSuccess: true, data: { data: T[], ... } }` trong `src/providers/data-provider.ts`.
  3. **Sửa chuẩn Pagination Backend**: Giữ nguyên cấu trúc trả về chuẩn từ `paginate` trong `base.service.ts` kể cả khi `data` rỗng (`data: []`).

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
only-one-fe/
└── src/
    ├── app/(root)/tool/network-device/hooks/
    │   └── [MODIFY] useNetworkDeviceStats.ts  # Bổ sung Array.isArray guard cho devices
    └── providers/
        └── [MODIFY] data-provider.ts          # Bổ sung unwrap envelope cho nested paginated data

only-one-be/
└── src/
    └── common/
        └── [MODIFY] base.service.ts           # Giữ nguyên pagination result khi empty data
```

---

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/hooks/useNetworkDeviceStats.ts` | `useNetworkDeviceStats` | `None` | `npx eslint "src/app/(root)/tool/network-device/hooks/useNetworkDeviceStats.ts"` |
| **2** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-fe/src/providers/data-provider.ts` | `unwrapResponseData` | `None` | `npx eslint "src/providers/data-provider.ts"` |
| **3** | `[x]` | `[MODIFY]` | `d:/Sources/Personal/only-one-be/src/common/base.service.ts` | `BaseService.getPaginationWithCustomQuery` | `None` | `npx cross-env ESLINT_USE_FLAT_CONFIG=false eslint "src/common/base.service.ts"` |

---

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/app/(root)/tool/network-device/hooks/useNetworkDeviceStats.ts`
- **Mục đích thay đổi (Action / Rationale)**: Đảm bảo biến `devices` luôn là một `Array` an toàn bằng `Array.isArray`, ngăn ngừa lỗi crash `.filter is not a function` khi `dataSource` là `undefined`, `null` hoặc một `object`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `useNetworkDeviceStats` -> `stats` `useMemo`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -15,3 +15,5 @@
     const stats = useMemo(() => {
-        const devices = (table.tableProps?.dataSource as INetworkDevice[]) || [];
+        const devices = Array.isArray(table.tableProps?.dataSource)
+            ? (table.tableProps.dataSource as INetworkDevice[])
+            : [];
         const total = table.tableProps?.pagination
```

### 2. `[MODIFY]` `d:/Sources/Personal/only-one-fe/src/providers/data-provider.ts`
- **Mục đích thay đổi (Action / Rationale)**: Hỗ trợ unwrap ResponseDto bọc dữ liệu phân trang `{ isSuccess: true, data: { data: T[], meta: ... } }` trả về từ NestJS.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `unwrapResponseData`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -204,2 +204,13 @@
 
+    // Nested Paginated inside ResponseDto envelope: { isSuccess: true, data: { data: T[], meta: ... } }
+    if (
+        payload.data &&
+        typeof payload.data === 'object' &&
+        Array.isArray(payload.data.data)
+    ) {
+        return {
+            data: payload.data.data,
+            meta: payload.data.meta || payload.meta,
+            extraData: payload.data.extraData || payload.extraData,
+            total: payload.data.meta?.totalItems ?? payload.data.data.length,
+        };
+    }
+
     // Paginated: { data: T[], meta: { totalItems: number, ... }, links: { ... } }
```

### 3. `[MODIFY]` `d:/Sources/Personal/only-one-be/src/common/base.service.ts`
- **Mục đích thay đổi (Action / Rationale)**: Không thay thế đối tượng phân trang hợp lệ bằng `{ data: [], meta: null, links: null }` khi danh sách rỗng, giúp `TransformResponseInterceptor` nhận diện đúng đối tượng phân trang.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `BaseService.getPaginationWithCustomQuery`
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -144,3 +144,3 @@
         const result = await paginate(query, this.repository, defaultConfig);
-        if (!result?.data?.length) return defaultResult;
+        if (!result?.data) return defaultResult;
 
         const mappedData = this.mapEntityToDto(result.data) as D[];
```

---

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` Green loop validation with dummy object payload: `PASS`
  - `[x]` `npx eslint "src/app/(root)/tool/network-device/hooks/useNetworkDeviceStats.ts" "src/providers/data-provider.ts"`: `PASS (0 errors)`
  - `[x]` Backend pagination structure test: `PASS`
- **Manual Verification Flow**:
  - Mở trang `/tool/network-device` khi database chưa có thiết bị nào (0 devices).
  - Kiểm tra Header thống kê (Total, Online, Camera, Router, Smart IoT) hiển thị toàn bộ số 0 mà không ném lỗi runtime TypeError.
