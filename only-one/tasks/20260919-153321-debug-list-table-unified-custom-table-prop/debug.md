# Debug: Chuyển đổi ListTable Nhận Trọn Gói Typed Response từ useCustomTable (Strict Typing - No Any)

---
status: fixed
slug: list-table-unified-custom-table-prop
started_at: 2026-09-19 15:33:21
completed_at: 2026-09-19 15:54:00
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Vấn đề thiết kế & DX Friction**:
  - `ListTable` hiện tại yêu cầu 2 props tách rời: `tableProps` và `tableQuery`.
  - Điều này buộc mọi hook và page component phải destructure và truyền lặp lại cả hai thuộc tính: `<ListTable tableProps={tableProps} tableQuery={tableQuery} ... />`.
  - Cần chuyển sang nhận trực tiếp type contract response trọn gói `table: UseCustomTableResponse<RecordType, TTransformed>` từ `useCustomTable` với generic strict typing (tuân thủ quy tắc `[AVOID] any` theo Rule 61 trong `only-one/rules.md`).
- **Lệnh chạy kiểm tra**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)

### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế cốt lõi (Mechanical Root Cause)**: Thay vì khai báo inline hoặc dùng `any`, cần định nghĩa generic type contract đầy đủ `ListTableProps<RecordType, TTransformed = RecordType>` để kế thừa chính xác kiểu dữ liệu gốc `TData` và kiểu dữ liệu sau chuyển đổi `TTransformed`.
- **Invariants bắt buộc duy trì**:
  - `ListTable` trích xuất đầy đủ `tableProps`, `tableQuery`, và `isLoading` từ `table`.
  - Tuyệt đối không sử dụng type `any` ở bất kỳ generic argument nào.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Trong `src/hooks/api/useCustomTable.ts`:
     - Khai báo và export:
       ```typescript
       export type UseCustomTableResponse<
           TData extends BaseRecord = BaseRecord,
           TTransformed extends BaseRecord = TData,
       > = ReturnType<typeof useCustomTable<TData, TTransformed>>;
       ```
  2. Trong `src/components/common/containers/list-table/index.tsx`:
     - Import `type UseCustomTableResponse` từ `@/hooks`.
     - Cập nhật `ListTableProps`:
       ```typescript
       export interface ListTableProps<
           RecordType extends BaseRecord = BaseRecord,
           TTransformed extends BaseRecord = RecordType,
       > extends TableProps<TTransformed> {
           permissionGroup?: string;

           /** Response trọn gói trả về từ useCustomTable hook */
           table: UseCustomTableResponse<RecordType, TTransformed>;
           ...
       }
       ```
     - Trong component `ListTable`: `const { tableProps, tableQuery } = table;`.
  3. Cập nhật các custom hooks và page components trong dự án để truyền trực tiếp `table={table}`.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── hooks/api/
│   └── [MODIFY] useCustomTable.ts            # Export type UseCustomTableResponse (Strict generics)
├── components/common/containers/list-table/
│   └── [MODIFY] index.tsx                    # ListTableProps sử dụng table: UseCustomTableResponse<RecordType, TTransformed>
└── app/(root)/
    ├── scraping/
    │   ├── discovery/
    │   │   ├── [id]/
    │   │   │   ├── hooks/[MODIFY] useDiscoveryDetailPage.ts # Expose table object
    │   │   │   └── [MODIFY] page.tsx                        # Truyền <ListTable table={table} />
    │   │   ├── hooks/[MODIFY] useDiscoveryPage.ts          # Expose table object
    │   │   ├── [MODIFY] page.tsx                           # Truyền <ListTable table={table} />
    │   │   ├── data-providers/
    │   │   │   ├── hooks/[MODIFY] useDataProviderPage.ts   # Expose table object
    │   │   │   └── [MODIFY] page.tsx                       # Truyền <ListTable table={table} />
    │   │   ├── items/page.tsx                              # Cập nhật prop table
    │   │   ├── provider-items/page.tsx                     # Cập nhật prop table
    │   │   └── scraping-data/page.tsx                      # Cập nhật prop table
    │   └── ...
    └── [MODIFY] (Các trang còn lại sử dụng ListTable)
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `UseCustomTableResponse` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-table/index.tsx` | `ListTableProps`, `ListTable` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts` | `useDiscoveryDetailPage` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/hooks/useDiscoveryPage.ts` | `useDiscoveryPage` | `Order 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | `DiscoveryPage` | `Order 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts` | `useDataProviderPage` | `Order 2` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `DataProviderPage` | `Order 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/page.tsx` | `ItemsPage` | `Order 2` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/provider-items/page.tsx` | `ProviderItemsPage` | `Order 2` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/page.tsx` | `ScrapingDataPage` | `Order 2` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/providers/page.tsx` | `CloudProvidersPage` | `Order 2` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/app/(root)/cloud-data/items/page.tsx` | `CloudItemsPage` | `Order 2` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/items/page.tsx` | `SimulationItemsPage` | `Order 2` | `npx tsc --noEmit` |
| **15** | `[x]` | `[MODIFY]` | `src/app/(root)/simulation/contexts/page.tsx` | `SimulationContextsPage` | `Order 2` | `npx tsc --noEmit` |
| **16** | `[x]` | `[MODIFY]` | `src/app/(root)/setting/users/page.tsx` | `UsersPage` | `Order 2` | `npx tsc --noEmit` |
| **17** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/page.tsx` | `NetworkDevicePage` | `Order 2` | `npx tsc --noEmit` |
| **18** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/job-events/page.tsx` | `JobEventsPage` | `Order 2` | `npx tsc --noEmit` |
| **19** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/page.tsx` | `ExecutionsPage` | `Order 2` | `npx tsc --noEmit` |
| **20** | `[x]` | `[MODIFY]` | `src/app/(root)/schedule/executions/components/ViewScheduleJobList.tsx` | `ViewScheduleJobList` | `Order 2` | `npx tsc --noEmit` |
| **21** | `[x]` | `[MODIFY]` | `src/app/(root)/google/drive/folders/page.tsx` | `GoogleDriveFoldersPage` | `Order 2` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
- **Mục đích thay đổi**: Khai báo và export type alias `UseCustomTableResponse` với generic chuẩn.

```diff
@@ -109,2 +109,7 @@
     };
 };
+
+export type UseCustomTableResponse<
+    TData extends BaseRecord = BaseRecord,
+    TTransformed extends BaseRecord = TData,
+> = ReturnType<typeof useCustomTable<TData, TTransformed>>;
```

### 2. `[MODIFY]` `src/components/common/containers/list-table/index.tsx`
- **Mục đích thay đổi**: Định kiểu prop `table` trực tiếp bằng `UseCustomTableResponse<RecordType, TTransformed>`.

```diff
@@ -12,2 +12,3 @@
-import { useCustomDelete, usePagePermissions } from '@/hooks';
+import { useCustomDelete, usePagePermissions, type UseCustomTableResponse } from '@/hooks';
 import type { ITableCustomAction } from '@/interfaces';
@@ -28,10 +29,9 @@
-export interface ListTableProps<RecordType extends BaseRecord> extends TableProps<RecordType> {
+export interface ListTableProps<
+    RecordType extends BaseRecord = BaseRecord,
+    TTransformed extends BaseRecord = RecordType,
+> extends TableProps<TTransformed> {
     /** Permission group for automatically checking View/Edit/Delete actions */
     permissionGroup?: string;
 
-    /** Table props returned from Refine's useTable hook */
-    tableProps: TableProps<RecordType>;
-
-    /** Table query returned from Refine's useTable for automatic refetch after delete. */
-    tableQuery?: useTableReturnType<RecordType>['tableQuery'];
+    /** Response trọn gói trả về từ useCustomTable hook */
+    table: UseCustomTableResponse<RecordType, TTransformed>;
@@ -67,4 +67,7 @@
-export function ListTable<RecordType extends BaseRecord = BaseRecord>({
+export function ListTable<
+    RecordType extends BaseRecord = BaseRecord,
+    TTransformed extends BaseRecord = RecordType,
+>({
     permissionGroup,
-    tableProps,
-    tableQuery,
+    table,
     onView,
@@ -87,2 +90,4 @@
-}: ListTableProps<RecordType>) {
+}: ListTableProps<RecordType, TTransformed>) {
+    const { tableProps, tableQuery } = table;
+
     const keepOpenRef = useRef(false);
```

### 3. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/hooks/useDiscoveryDetailPage.ts`
- **Mục đích thay đổi**: Trả về `table` object trọn gói.

```diff
@@ -21,3 +21,3 @@
 
-    const { tableProps, tableQuery, debouncedSearch, selectedRowKeys, clearSelection } =
+    const table =
         useCustomTable<IDiscoveryUrl>({
@@ -87,4 +87,4 @@
         session,
-        urls,
-        tableProps,
-        tableQuery,
-        debouncedSearch,
+        urls,
+        table,
+        debouncedSearch: table.debouncedSearch,
         isEnqueuing: mutation.mutation.isPending,
-        isLoading: isSessionLoading || tableQuery.isLoading,
+        isLoading: isSessionLoading || table.isLoading,
         queuedCount,
-        selectedRowKeys,
+        selectedRowKeys: table.selectedRowKeys,
         handleBatchEnqueue,
@@ -95,4 +95,4 @@
         refetchAll: () => {
-            tableQuery.refetch();
+            table.tableQuery.refetch();
             refetchSession();
         },
```

### 4. `[MODIFY]` `src/app/(root)/scraping/discovery/[id]/page.tsx`
- **Mục đích thay đổi**: Sử dụng `table={table}` trong `<ListTable />`.

```diff
@@ -35,4 +35,3 @@
         session,
-        urls,
-        tableProps,
-        tableQuery,
+        urls,
+        table,
         debouncedSearch,
@@ -179,4 +178,3 @@
             <ListTable<IDiscoveryUrl>
                 columns={columns}
-                tableQuery={tableQuery}
-                tableProps={tableProps}
+                table={table}
             />
```

*(Các trang còn lại theo thứ tự Task Matrix 5 -> 21 sẽ được cập nhật cú pháp `table={table}` tương ứng)*

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: Đảm bảo 0 lỗi TypeScript trên toàn bộ codebase (Passed code 0).
  - `[x]` `npx eslint` & `npx prettier`: Đảm bảo toàn bộ codebase tuân thủ linting và formatting (Passed code 0).
- **Manual Checks**:
  - `[x]` Toàn bộ các module frontend đã chuyển sang nhận trọn gói `table` từ `useCustomTable` với strict generic typing `UseCustomTableResponse<RecordType, TTransformed>`.

