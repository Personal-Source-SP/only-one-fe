# Debug: Tối ưu và Dọn dẹp Các Trường Trùng Lặp Trong Response của useCustomTable

---
status: fixed
slug: use-custom-table-return-cleanup
started_at: 2026-09-19 18:22:00
completed_at: 2026-09-19 18:26:00
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Vấn đề thiết kế & DX Redundancy**:
  - Trong `src/hooks/api/useCustomTable.ts`, `customTableProps` đã đóng gói hoàn chỉnh các thuộc tính của Ant Design Table (`dataSource`, `loading`, `pagination`, `onChange`, `rowKey`, `rowSelection`).
  - Tuy nhiên, object trả về ở cuối hook vẫn trả thừa một số trường trùng lặp / không cần thiết:
    1. `handleTableChange`: Đã được binding trực tiếp vào `tableProps.onChange`. Các caller không bao giờ gọi hàm này thủ công.
    2. Thứ tự và cấu trúc trả về giữa `...result`, `tableProps`, `isLoading`, các selection helpers cần được chuẩn hoá gọn gàng, loại bỏ các alias gây phân tán trạng thái.
- **Lệnh kiểm tra tái hiện / chống hồi quy**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế cốt lõi (Mechanical Root Cause)**:
  - Khi thiết kế `useCustomTable`, một số handler nội bộ (`handleTableChange`) được return ra ngoài theo thói quen mà không có consumer nào sử dụng.
  - `customTableProps` được khởi tạo và ghi đè `result.tableProps`, do đó chỉ cần export các API thực sự có giá trị cho người dùng bên ngoài:
    - `tableProps`: Chứa toàn bộ props cho Table (`dataSource`, `pagination`, `loading`, `onChange`, `rowKey`, `rowSelection`).
    - `tableQuery`: Refine query object dùng cho `refetch`, `data`, `isFetching`.
    - `setFilters`, `setSorters`, `setCurrentPage`, `setPageSize`: Các state setters phục vụ Search / Filter panel.
    - `debouncedSearch`: Utility debounce search.
    - `selection`: Các helper thao tác chọn dòng (`selectedRowKeys`, `setSelectedRowKeys`, `selectedCount`, `hasSelected`, `clearSelection`) phục vụ các action batch buttons trên Header / Toolbar.
- **Invariants bắt buộc duy trì**:
  - `tableProps.onChange` tiếp tục sử dụng `handleTableChange` nội bộ.
  - Không phá vỡ `UseCustomTableResponse` interface đang được `ListTable` và các trang sử dụng.
  - Tuyệt đối không dùng type `any`.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp (Core Fix Mechanism)**:
  1. Loại bỏ `handleTableChange` khỏi object trả về của `useCustomTable` vì đã có trong `tableProps.onChange`.
  2. Gom nhóm toàn bộ state & helper của tính năng chọn dòng thành object `selection` trong response:
     ```typescript
     return {
         ...result,
         tableProps: customTableProps,
         isLoading: Boolean(result.tableQuery.isLoading),
         debouncedSearch,
         selection: {
             selectedRowKeys,
             setSelectedRowKeys,
             selectedCount: selectedRowKeys.length,
             hasSelected: selectedRowKeys.length > 0,
             clearSelection: () => setSelectedRowKeys([]),
         },
     };
     ```
  3. Cập nhật các caller sử dụng selection (`useDiscoveryDetailPage.ts` và `DiscoveryDetailPage`) để truy cập thông qua `table.selection.*`.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── hooks/api/
│   └── [MODIFY] useCustomTable.ts                              # Loại bỏ handleTableChange, gom selection helpers
└── app/(root)/scraping/discovery/[id]/
    ├── hooks/[MODIFY] useDiscoveryDetailPage.ts                # Truy cập table.selection.*
    └── [MODIFY] page.tsx                                       # Truy cập table.selection.*
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `useCustomTable` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts` | `useDiscoveryDetailPage` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` | `Order 2` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
- **Mục đích thay đổi**: Loại bỏ `handleTableChange` và gom nhóm `selection` helpers vào object riêng.
- **Điểm can thiệp**: `return` statement của `useCustomTable`.

```diff
@@ -99,12 +99,13 @@
     return {
         ...result,
         tableProps: customTableProps,
         isLoading: Boolean(result.tableQuery.isLoading),
         debouncedSearch,
-        handleTableChange,
-        selectedRowKeys,
-        setSelectedRowKeys,
-        selectedCount: selectedRowKeys.length,
-        hasSelected: selectedRowKeys.length > 0,
-        clearSelection: () => setSelectedRowKeys([]),
+        selection: {
+            selectedRowKeys,
+            setSelectedRowKeys,
+            selectedCount: selectedRowKeys.length,
+            hasSelected: selectedRowKeys.length > 0,
+            clearSelection: () => setSelectedRowKeys([]),
+        },
     };
```

### 2. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts`
- **Mục đích thay đổi**: Cập nhật truy cập `table.selection.*`.

```diff
@@ -52,7 +52,7 @@
-        if (table.selectedRowKeys.length === 0) return;
+        if (table.selection.selectedRowKeys.length === 0) return;
         await handleCustomMutationData({
             url: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
-            values: { urlIds: table.selectedRowKeys as string[] },
+            values: { urlIds: table.selection.selectedRowKeys as string[] },
             method: 'post',
             successNotification: {
                 type: 'success',
-                message: `Đã đẩy ${table.selectedRowKeys.length} URLs vào hàng đợi cào`,
+                message: `Đã đẩy ${table.selection.selectedCount} URLs vào hàng đợi cào`,
             },
             onSuccess: () => {
-                table.clearSelection();
+                table.selection.clearSelection();
                 table.tableQuery.refetch();
                 refetchSession();
             },
@@ -93,3 +93,3 @@
-        selectedRowKeys: table.selectedRowKeys,
+        selection: table.selection,
```

### 3. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/page.tsx`
- **Mục đích thay đổi**: Sử dụng `selection` từ `useDiscoveryDetailPage`.

```diff
@@ -40,3 +40,3 @@
         queuedCount,
-        selectedRowKeys,
+        selection,
         handleBatchEnqueue,
@@ -145,3 +145,3 @@
-                    disabled={selectedRowKeys.length === 0}
+                    disabled={!selection.hasSelected}
                     onClick={handleBatchEnqueue}
                 >
-                    Đẩy vào hàng đợi cào ({selectedRowKeys.length})
+                    Đẩy vào hàng đợi cào ({selection.selectedCount})
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: Xác nhận không có lỗi type check trên toàn bộ dự án (Passed code 0).
  - `[x]` `npx eslint`: Xác nhận không vi phạm quy tắc linting (Passed code 0).
- **Manual Checks**:
  - `[x]` Đã chuyển đổi tính năng batch enqueue trong Discovery Detail Page hoạt động chính xác với `selection`.


