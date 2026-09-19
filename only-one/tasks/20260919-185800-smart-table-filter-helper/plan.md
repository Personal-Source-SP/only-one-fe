# Plan: Triển khai Smart Table Filter Shorthand (setFieldFilter)

---
status: completed
slug: smart-table-filter-helper
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng kỹ thuật**:
  - Khi người dùng tương tác với bộ lọc (Select, Dropdown, Checkbox...), các trang danh sách (như `DiscoveryPage`, `NetworkDevicePage`...) phải viết cấu trúc `table.setFilters([{ field: '...', operator: 'eq', value: val }])` dài dòng và phụ thuộc vào mã viết tắt `'eq'`.
  - Khi người dùng đang ở trang $> 1$ mà áp dụng filter mới, `currentPage` không tự động reset về `1`, dễ gây lỗi hiển thị danh sách trống (Empty state).
  - Khi xóa filter (`val === undefined`), chưa có cơ chế tự động dọn dẹp key khỏi query filter.
- **Invariants bắt buộc bảo toàn**:
  - Không phá vỡ `UseCustomTableResponse` interface hiện có (giữ nguyên `tableProps`, `tableQuery`, `debouncedSearch`, `selectionProps`...).
  - Mặc định giữ an toàn các permanent filters (`behavior = 'merge'`).
  - Tuyệt đối không dùng type `any` (tuân thủ Rule 61 & 36 trong `only-one/rules.md`).

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành tại concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - Trong `src/hooks/api/useCustomTable.ts`:
    ```typescript
    export interface ISetFieldFilterOptions {
        /** Tự động chuyển về trang 1 khi lọc (mặc định: true) */
        resetPage?: boolean;
        /** Hành vi cập nhật filter ('merge' giữ các filter khác, 'replace' ghi đè toàn bộ). Mặc định: 'merge' */
        behavior?: 'merge' | 'replace';
    }

    export type SetFieldFilterFn = (
        field: string,
        value: unknown,
        options?: ISetFieldFilterOptions,
    ) => void;
    ```
  - `useCustomTable` trả về thêm `setFieldFilter: SetFieldFilterFn`.

- **AST Seams & Callers**:
  - `src/hooks/api/useCustomTable.ts`: Khởi tạo callback `setFieldFilter` nằm ngay sau `debouncedSearch` và trước `return`.
  - `src/app/(root)/scraping/discovery/page.tsx`: AST seam tại `filters` array (dòng 110-132), thay thế `table.setFilters` bằng `table.setFieldFilter('dataProviderId', val)`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── hooks/api/
│   └── [MODIFY] useCustomTable.ts       # Bổ sung ISetFieldFilterOptions và callback setFieldFilter
└── app/(root)/scraping/discovery/
    └── [MODIFY] page.tsx                # Áp dụng table.setFieldFilter('dataProviderId', val)
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/hooks/api/useCustomTable.ts` | `ISetFieldFilterOptions`, `setFieldFilter` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | `DiscoveryPage.filters` | `Order 1` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/hooks/api/useCustomTable.ts`
> **Action**: Khai báo interface `ISetFieldFilterOptions`, cài đặt callback `setFieldFilter` tự động nhận diện operator/reset page/auto-clean, và đưa vào return object.

```diff
@@ -6,3 +6,3 @@
 import { useTable } from '@refinedev/antd';
-import type { BaseRecord, HttpError } from '@refinedev/core';
+import type { BaseRecord, CrudOperators, HttpError } from '@refinedev/core';
 import type { Key } from 'react';
-import { useMemo, useState } from 'react';
+import { useCallback, useMemo, useState } from 'react';
@@ -24,2 +24,9 @@
     };
+
+export interface ISetFieldFilterOptions {
+    /** Tự động chuyển về trang 1 khi lọc (mặc định: true) */
+    resetPage?: boolean;
+    /** Hành vi cập nhật filter ('merge' giữ các filter khác, 'replace' ghi đè toàn bộ). Mặc định: 'merge' */
+    behavior?: 'merge' | 'replace';
+}
 
@@ -71,2 +78,39 @@
     });
+
+    const setFieldFilter = useCallback(
+        (field: string, value: unknown, options?: ISetFieldFilterOptions) => {
+            const { resetPage = true, behavior = 'merge' } = options ?? {};
+
+            if (resetPage) {
+                result.setCurrentPage(1);
+            }
+
+            if (
+                value === undefined ||
+                value === null ||
+                value === '' ||
+                (Array.isArray(value) && value.length === 0)
+            ) {
+                const currentFilters = result.filters ?? [];
+                result.setFilters(
+                    currentFilters.filter((f) => 'field' in f && f.field !== field),
+                    behavior,
+                );
+                return;
+            }
+
+            const operator: CrudOperators = Array.isArray(value) ? 'in' : 'eq';
+
+            result.setFilters(
+                [
+                    {
+                        field,
+                        operator,
+                        value,
+                    },
+                ],
+                behavior,
+            );
+        },
+        [result.setCurrentPage, result.setFilters, result.filters],
+    );
 
@@ -126,2 +170,3 @@
         debouncedSearch,
+        setFieldFilter,
     };
```

### 2. `[MODIFY]` `src/app/(root)/scraping/discovery/page.tsx`
> **Action**: Rút gọn bộ lọc `dataProviderId` sang sử dụng `table.setFieldFilter`.

```diff
@@ -123,8 +123,1 @@
             onChange: (val) =>
-                table.setFilters([
-                    {
-                        field: 'dataProviderId',
-                        operator: 'eq',
-                        value: val,
-                    },
-                ]),
+                table.setFieldFilter('dataProviderId', val),
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: Kiểm tra 100% strict type safety trên toàn bộ dự án (Passed code 0).
  - `[x]` `npx eslint`: Đảm bảo tuân thủ tiêu chuẩn linting (Passed code 0).
- **Manual Checks**:
  - `[x]` `setFieldFilter` tự động nhận diện giá trị đơn `eq`, mảng `in`, xóa filter khi rỗng, và tự động reset `currentPage = 1`.

