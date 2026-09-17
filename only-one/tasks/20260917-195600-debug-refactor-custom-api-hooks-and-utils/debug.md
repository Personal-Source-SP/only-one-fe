# Debug: Tối ưu hóa Custom API Hooks & Tách Utilities Chuẩn Hóa

---
status: fixed
slug: refactor-custom-api-hooks-and-utils
started_at: 2026-09-17 19:56:00
completed_at: 2026-09-17 20:01:10
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Các điểm tồn đọng cần cải tiến (Symptoms & Debt Analysis)**:
  1. **`useCustomList.ts` (L47-L55)**: `applyDataTransform` đang bị bọc ép kiểu cồng kềnh `(refineResult.query.data?.data ?? []) as unknown as TData[]`, tạo array rỗng mới ngoài ý muốn thay vì truyền trực tiếp `refineResult.query.data?.data`.
  2. **`useCustomModal.ts` (L36-L55)**: Khối `resolvedNotifications`, `handleMutationSuccess`, `handleMutationError` bị tách rời phân mảnh thay vì gom gọn gàng vào cấu hình của `useModalForm`. `handleMutationError` tạo wrapper function dư thừa thay vì truyền trực tiếp `onMutationError`.
  3. **`useCustomOne.ts` (L48-L56)**: `isLoading: refineResult.query.isLoading` chưa bọc `Boolean(...)` để đảm bảo strictly boolean, và cần đồng bộ cấu trúc `applyDataTransform`.
  4. **`useCustomSelect.ts` (L37-L47) & `useCustomTable.ts` (L21-L40)**: Các hàm helper pure utilities (`getDefaultOptionValue`, `getDefaultOptionLabel`, `resolveRowKey`) đang bị khai báo cục bộ trong file hook thay vì đưa vào module `src/utilities/api-hooks/` dùng chung.
  5. **`useCustomTable.ts` (L86-L90)**: `rawDataSource = (result.tableProps.dataSource ?? []) as TData[]` khởi tạo mảng rỗng mới trên mỗi lần render khiến dependency của `useMemo` bị kích hoạt lại không cần thiết; thiếu truyền `result.tableQuery.data` làm `rawResponse` cho `applyDataTransform`.
- **Lệnh kiểm tra tái hiện / Typecheck**:
  ```bash
  npx tsc --noEmit
  ```

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  - Chưa phân tách triệt để các pure helper ra khỏi hook logic, vi phạm nguyên tắc Single Responsibility Principle và Clean Architecture.
  - Xử lý mảng fallback inline trong dependencies (`?? []`) làm phá vỡ cơ chế caching tham chiếu của React `useMemo`.
  - Type casting rườm rà `as unknown as TData[]` và wrapper function dư thừa làm tăng cognitive load.
- **Invariants bị vi phạm**:
  - *Clean Utilities Seam*: Mọi pure domain-agnostic helpers (label formatting, key resolution) phải nằm trong `@/utilities/api-hooks/`.
  - *Stable Memo References*: Không tạo đối tượng mảng mới inline trong thân hook trước khi đưa vào dependency của `useMemo`.
  - *Consistent Root Contract*: Mọi API hook luôn trả về `isLoading: Boolean(...)` chuẩn boolean.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Tạo `src/utilities/api-hooks/select.ts` chứa `getDefaultOptionValue`, `getDefaultOptionLabel`.
  2. Tạo `src/utilities/api-hooks/table.ts` chứa `resolveRowKey`.
  3. Xuất các utilities mới tại `src/utilities/api-hooks/index.ts`.
  4. Cập nhật `useCustomList`, `useCustomModal`, `useCustomOne`, `useCustomSelect`, `useCustomTable`, `useCustomData` áp dụng các utilities chuẩn và tối giản code.
- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/
├── utilities/
│   └── api-hooks/
│       ├── [NEW]    select.ts      # Chứa getDefaultOptionValue, getDefaultOptionLabel
│       ├── [NEW]    table.ts       # Chứa resolveRowKey
│       └── [MODIFY] index.ts       # Barrel re-export select và table utilities
└── hooks/
    └── api/
        ├── [MODIFY] useCustomList.ts    # Tối giản applyDataTransform và đồng bộ Boolean(isLoading)
        ├── [MODIFY] useCustomModal.ts   # Gom resolvedNotifications và gọn handler vào useModalForm
        ├── [MODIFY] useCustomOne.ts     # Chuẩn hóa Boolean(isLoading) và data transform
        ├── [MODIFY] useCustomSelect.ts  # Import getDefaultOptionValue/Label từ @/utilities
        ├── [MODIFY] useCustomTable.ts   # Import resolveRowKey từ @/utilities và tối ưu useMemo dataSource
        └── [MODIFY] useCustomData.ts    # Đảm bảo isLoading: Boolean(query.isLoading)
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/utilities/api-hooks/select.ts` | `getDefaultOptionValue, getDefaultOptionLabel` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/utilities/api-hooks/table.ts` | `resolveRowKey` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/utilities/api-hooks/index.ts` | Barrel Exports | `Order 1, Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomList.ts` | `useCustomList.transformedData` | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomModal.ts` | `useCustomModal` | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomOne.ts` | `useCustomOne.isLoading` | `None` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomSelect.ts` | `useCustomSelect` | `Order 3` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `useCustomTable` | `Order 3` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomData.ts` | `useCustomData.isLoading` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[NEW]` `src/utilities/api-hooks/select.ts`
- **Mục đích thay đổi**: Khởi tạo module chứa pure utilities định dạng select option label & value.
- **Source Code**:
```typescript
import type { BaseRecord } from '@refinedev/core';

export const getDefaultOptionValue = <T extends BaseRecord>(item: T): string => {
    return String(item.id ?? '');
};

export const getDefaultOptionLabel = <T extends BaseRecord>(item: T): string => {
    const record = item as Record<string, unknown>;
    if (typeof record.name === 'string') return record.name;
    if (typeof record.title === 'string') return record.title;
    if (typeof record.label === 'string') return record.label;
    return String(item.id ?? '');
};
```

### 2. `[NEW]` `src/utilities/api-hooks/table.ts`
- **Mục đích thay đổi**: Khởi tạo module chứa pure utilities phân giải rowKey cho bảng Ant Design.
- **Source Code**:
```typescript
import type { BaseRecord } from '@refinedev/core';

export const resolveRowKey = <TRecord extends BaseRecord>(
    record: TRecord,
    rowKey?: keyof TRecord | ((record: TRecord) => string),
): string => {
    if (typeof rowKey === 'function') {
        return rowKey(record);
    }
    if (rowKey) {
        return String(record[rowKey]);
    }
    const rec = record as Record<string, unknown>;
    if (rec.id !== undefined && rec.id !== null) {
        return String(rec.id);
    }
    if (rec._id !== undefined && rec._id !== null) {
        return String(rec._id);
    }
    return '';
};
```

### 3. `[MODIFY]` `src/utilities/api-hooks/index.ts`
- **Mục đích thay đổi**: Barrel re-export `select.ts` và `table.ts`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -3,2 +3,4 @@
 export * from './transform';
 export * from './form';
+export * from './select';
+export * from './table';
```

### 4. `[MODIFY]` `src/hooks/api/useCustomList.ts`
- **Mục đích thay đổi**: Tối giản `transformedData` truyền trực tiếp `refineResult.query.data?.data`, đảm bảo `Boolean(isLoading)`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -47,9 +47,5 @@
     const transformedData = useMemo(
-        () =>
-            applyDataTransform(
-                (refineResult.query.data?.data ?? []) as unknown as TData[],
-                refineResult.query.data,
-                transform,
-            ),
+        () => applyDataTransform(refineResult.query.data?.data, refineResult.query.data, transform),
         [refineResult.query.data, transform],
     );
 
@@ -58,4 +54,4 @@
     return {
         ...refineResult,
         data: transformedData,
-        isLoading: refineResult.query.isLoading,
+        isLoading: Boolean(refineResult.query.isLoading),
     };
```

### 5. `[MODIFY]` `src/hooks/api/useCustomModal.ts`
- **Mục đích thay đổi**: Gom `resolveFormNotifications` và mutation callbacks gọn gàng vào `useModalForm`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -1,5 +1,5 @@
 import type { IBaseApiNotificationRequest, IBaseApiResourceRequest } from '@/interfaces';
-import { resolveFormNotifications } from '@/utilities';
+import { resolveFormNotifications, unwrapApiResponse } from '@/utilities';
 import { useModalForm } from '@refinedev/antd';
 import type { BaseRecord, HttpError } from '@refinedev/core';
@@ -37,20 +37,2 @@
-    const resolvedNotifications = resolveFormNotifications({
-        resource,
-        action,
-        errorNotification,
-        successNotification,
-    });
-
-    const handleMutationSuccess = onMutationSuccess
-        ? (response: any) => {
-              const payload = response?.data !== undefined ? response.data : response;
-              onMutationSuccess(payload);
-          }
-        : undefined;
-
-    const handleMutationError = onMutationError
-        ? (error: HttpError) => {
-              onMutationError(error);
-          }
-        : undefined;
-
     const { open, show, close, formProps, modalProps, formLoading } = useModalForm<
@@ -67,3 +49,12 @@
-        ...resolvedNotifications,
-        onMutationError: handleMutationError,
-        onMutationSuccess: handleMutationSuccess,
+        ...resolveFormNotifications({
+            resource,
+            action,
+            errorNotification,
+            successNotification,
+        }),
+        onMutationError,
+        onMutationSuccess: onMutationSuccess
+            ? (response: unknown) =>
+                  onMutationSuccess((unwrapApiResponse<TData>(response) ?? response) as TData)
+            : undefined,
     });
```

### 6. `[MODIFY]` `src/hooks/api/useCustomOne.ts`
- **Mục đích thay đổi**: Chuẩn hóa `isLoading: Boolean(refineResult.query.isLoading)`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -54,4 +54,4 @@
     return {
         ...refineResult,
         data: transformedData,
-        isLoading: refineResult.query.isLoading,
+        isLoading: Boolean(refineResult.query.isLoading),
     };
```

### 7. `[MODIFY]` `src/hooks/api/useCustomSelect.ts`
- **Mục đích thay đổi**: Xóa hàm nội bộ `getDefaultOptionValue`, `getDefaultOptionLabel` và import từ `@/utilities`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -19,1 +19,6 @@
-import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
+import {
+    applyDataTransform,
+    getDefaultOptionLabel,
+    getDefaultOptionValue,
+    resolveQueryNotifications,
+} from '@/utilities';
@@ -37,12 +42,0 @@
-const getDefaultOptionValue = <T extends BaseRecord>(item: T): string => {
-    return String(item.id ?? '');
-};
-
-const getDefaultOptionLabel = <T extends BaseRecord>(item: T): string => {
-    const record = item as Record<string, unknown>;
-    if (typeof record.name === 'string') return record.name;
-    if (typeof record.title === 'string') return record.title;
-    if (typeof record.label === 'string') return record.label;
-    return String(item.id ?? '');
-};
-
```

### 8. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
- **Mục đích thay đổi**: Xóa `resolveRowKey` nội bộ và import từ `@/utilities`; tối ưu `useMemo` cho `transformedDataSource`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -3,1 +3,1 @@
-import { applyDataTransform, resolveQueryNotifications } from '@/utilities';
+import { applyDataTransform, resolveQueryNotifications, resolveRowKey } from '@/utilities';
@@ -22,19 +22,0 @@
-const resolveRowKey = <TRecord extends BaseRecord>(
-    record: TRecord,
-    rowKey?: keyof TRecord | ((record: TRecord) => string),
-): string => {
-    if (typeof rowKey === 'function') {
-        return rowKey(record);
-    }
-    if (rowKey) {
-        return String(record[rowKey]);
-    }
-    const rec = record as Record<string, unknown>;
-    if (rec.id !== undefined && rec.id !== null) {
-        return String(rec.id);
-    }
-    if (rec._id !== undefined && rec._id !== null) {
-        return String(rec._id);
-    }
-    return '';
-};
@@ -87,4 +68,7 @@
-    const rawDataSource = (result.tableProps.dataSource ?? []) as TData[];
-    const transformedDataSource = useMemo<TTransformed[]>(() => {
-        return applyDataTransform(rawDataSource, undefined, transform);
-    }, [rawDataSource, transform]);
+    const transformedDataSource = useMemo<TTransformed[]>(() => {
+        return applyDataTransform(
+            result.tableProps.dataSource as TData[] | undefined,
+            result.tableQuery.data,
+            transform,
+        );
+    }, [result.tableProps.dataSource, result.tableQuery.data, transform]);
```

### 9. `[MODIFY]` `src/hooks/api/useCustomData.ts`
- **Mục đích thay đổi**: Đảm bảo `isLoading: Boolean(query.isLoading)`.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -68,4 +68,4 @@
         result,
         data: transformedData,
-        isLoading: query.isLoading,
+        isLoading: Boolean(query.isLoading),
     };
```

## Section 5. Verification & Regression Guard
- **Automated Verification**:
  - `[x]` TypeScript Typecheck: `npx tsc --noEmit` ➔ `PASS (0 errors)`
  - `[x]` ESLint Verification: `npx eslint "src/hooks/api/**" "src/utilities/api-hooks/**"` ➔ `PASS (0 errors, 0 warnings)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Tách triệt để pure utility functions ra khỏi custom hooks vào `@/utilities/api-hooks/`.
  - Không tạo mảng rỗng `?? []` bên ngoài `useMemo` làm mất hiệu lực dependency checking.

