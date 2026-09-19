---
status: done
slug: 20260919-143200-refactor-data-providers-hooks-and-fields
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Tái cấu trúc Data Providers (Xóa Field Constants & Tạo Page Hook)

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**: Module `data-providers` đang dùng `DATA_PROVIDER_FIELDS` trong `constants/data-provider-field.constants.ts` để gộp chung metadata cột bảng và form rules vào một object lớn. Trong khi đó, `page.tsx` chứa trực tiếp các hook gọi API (`useCustomTable`, 2 instance `useCustomModalForm`).
- **Điểm nghẽn**: Gây phức tạp hóa việc đọc/sửa đổi UI, tạo tầng trung gian thừa, và `page.tsx` gánh cả logic state và rendering.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên các quy tắc validate form (`FormRuleType.Required`, `FormRuleType.Max`, `FormRuleType.Code`, `FormRuleType.Url`).
  - Giữ nguyên cơ chế tự động sinh mã identifier qua `slugify(name, 20)`.
  - Giữ nguyên chức năng điều hướng đến chi tiết tính năng `/scraping/features/[id]` và các callback refetch data sau mutation.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `useDataProviderPage()`: Hook trả về `{ tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm }`.
- **AST Seams & Callers**:
  - `src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts`: [NEW] Chứa `useCustomTable` và `useCustomModalForm`.
  - `src/app/(root)/scraping/data-providers/hooks/index.ts`: [NEW] Barrel export.
  - `src/app/(root)/scraping/data-providers/constants/`: [DELETE] Xóa bỏ `data-provider-field.constants.ts` và `index.ts`.
  - `src/app/(root)/scraping/data-providers/page.tsx`: [MODIFY] Sử dụng `useDataProviderPage` và định nghĩa `columns` / `formFields` trực tiếp.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/app/(root)/scraping/data-providers/
├── [DELETE] constants/
│   ├── [DELETE] data-provider-field.constants.ts # Xóa monolithic schema constants
│   └── [DELETE] index.ts                        # Xóa barrel export constants
├── [NEW]    hooks/
│   ├── [NEW]    index.ts                        # Barrel export cho page hooks
│   └── [NEW]    useDataProviderPage.ts          # Custom hook quản lý data & form modals
└── [MODIFY] page.tsx                            # Presentation component tinh gọn
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts` | `useDataProviderPage` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/hooks/index.ts` | Barrel exports | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `DataProviderPage` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts` | Xóa file | `Order 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/data-providers/constants/index.ts` | Xóa file | `Order 4` | `npx eslint src` |

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/data-providers/hooks/useDataProviderPage.ts`
> **Action**: Tạo custom hook quản lý toàn bộ data table và modal forms cho trang Data Providers.

```typescript
'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IDataProvider, IDataProviderFormValues } from '../types';

export const useDataProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        IDataProvider,
        IDataProviderFormValues,
        IDataProvider
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        IDataProvider,
        IDataProviderFormValues,
        IDataProvider
    >({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            baseUrl: record.baseUrl,
            identifier: record.identifier,
        }),
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
```

---

### 2. `[NEW]` `src/app/(root)/scraping/data-providers/hooks/index.ts`
> **Action**: Barrel export cho hooks.

```typescript
export * from './useDataProviderPage';
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/data-providers/page.tsx`
> **Action**: Sử dụng hook `useDataProviderPage`, xóa import `DATA_PROVIDER_FIELDS`, khai báo `columns` và `formFields` trực tiếp.

```diff
@@ -11,8 +11,9 @@
 import { CustomButton, type ColumnsType } from '@/components/custom-antd';
 import { RESOURCE } from '@/config';
 import type { FormMode } from '@/hooks';
-import { useCustomModalForm, useCustomTable } from '@/hooks';
 import { formatDate, slugify } from '@/libs';
+import { FormRuleType } from '@/utilities';
 import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
 import { useRouter } from 'next/navigation';
-import { DATA_PROVIDER_FIELDS } from './constants';
+import { useDataProviderPage } from './hooks';
 import type { IDataProvider, IDataProviderFormValues } from './types/data-provider.type';
 
 export default function DataProviderPage() {
     const router = useRouter();
-
-    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
-        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
-    });
-
-    const createModalForm = useCustomModalForm<...>(...);
-    const editModalForm = useCustomModalForm<...>(...);
+    const { tableProps, tableQuery, debouncedSearch, createModalForm, editModalForm } =
+        useDataProviderPage();
 
     const columns: ColumnsType<IDataProvider> = [
         {
-            dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
-            key: DATA_PROVIDER_FIELDS.NAME.key,
-            ...DATA_PROVIDER_FIELDS.NAME.table,
+            title: 'Tên',
+            dataIndex: 'name',
+            key: 'name',
+            width: '25%',
+            sorter: true,
+            ellipsis: true,
             render: (name: string, record) => (
                 <CustomButton
                     type="link"
@@ -69,19 +70,27 @@
         },
         {
-            dataIndex: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-            key: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-            ...DATA_PROVIDER_FIELDS.IDENTIFIER.table,
+            title: 'Mã',
+            dataIndex: 'identifier',
+            key: 'identifier',
+            width: '15%',
+            sorter: true,
+            ellipsis: true,
         },
         {
-            dataIndex: DATA_PROVIDER_FIELDS.BASE_URL.key,
-            key: DATA_PROVIDER_FIELDS.BASE_URL.key,
-            ...DATA_PROVIDER_FIELDS.BASE_URL.table,
+            title: 'URL cơ sở',
+            dataIndex: 'baseUrl',
+            key: 'baseUrl',
+            width: '30%',
+            sorter: true,
+            ellipsis: true,
         },
         {
-            dataIndex: DATA_PROVIDER_FIELDS.CREATED_AT.key,
-            key: DATA_PROVIDER_FIELDS.CREATED_AT.key,
-            ...DATA_PROVIDER_FIELDS.CREATED_AT.table,
+            title: 'Ngày tạo',
+            dataIndex: 'createdAt',
+            key: 'createdAt',
+            width: '15%',
+            sorter: true,
             render: (createdAt: Date) => formatDate(createdAt),
         },
     ];
@@ -107,7 +116,7 @@
         {
             name: 'search',
             type: 'input',
             isPrimary: true,
-            placeholder: `Tìm kiếm theo ${DATA_PROVIDER_FIELDS.NAME.label.toLowerCase()}`,
+            placeholder: 'Tìm kiếm theo tên nhà cung cấp...',
             onChange: (value) => debouncedSearch(value?.toString() ?? ''),
         },
     ];
 
     const formFields: IFormField<IDataProviderFormValues>[] = [
         {
-            name: DATA_PROVIDER_FIELDS.NAME.key,
-            label: DATA_PROVIDER_FIELDS.NAME.label,
-            ...DATA_PROVIDER_FIELDS.NAME.form,
+            name: 'name',
+            label: 'Tên nhà cung cấp',
+            type: 'input',
+            placeholder: 'Nhập tên nhà cung cấp',
+            rulesConfig: [
+                {
+                    type: FormRuleType.Required,
+                    message: 'Vui lòng nhập tên nhà cung cấp',
+                },
+                {
+                    type: FormRuleType.Max,
+                    max: 255,
                     message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
                 },
             ],
         },
         {
-            name: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-            label: DATA_PROVIDER_FIELDS.IDENTIFIER.label,
+            name: 'identifier',
+            label: 'Mã nhà cung cấp',
+            type: 'input',
+            placeholder: 'Nhập mã nhà cung cấp',
             disabled: (mode: FormMode) => mode === 'edit',
             addonAfter: (form, mode: FormMode) =>
                 mode === 'create' ? (
                     <CustomButton
                         type="text"
                         size="small"
                         onClick={() => {
                             if (!form) return;
-                            const currentName = form.getFieldValue(DATA_PROVIDER_FIELDS.NAME.key);
+                            const currentName = form.getFieldValue('name');
                             if (currentName) {
                                 form.setFieldValue(
-                                    DATA_PROVIDER_FIELDS.IDENTIFIER.key,
+                                    'identifier',
                                     slugify(currentName, 20),
                                 );
-                                form.validateFields([DATA_PROVIDER_FIELDS.IDENTIFIER.key]);
+                                form.validateFields(['identifier']);
                             }
                         }}
                         className="flex items-center gap-1 font-medium text-hub-primary"
                     >
                         <ThunderboltOutlined />
                         Tự động sinh
                     </CustomButton>
                 ) : undefined,
-            ...DATA_PROVIDER_FIELDS.IDENTIFIER.form,
+            rulesConfig: [
+                {
+                    type: FormRuleType.Required,
+                    message: 'Vui lòng nhập mã nhà cung cấp',
+                },
+                {
+                    type: FormRuleType.Max,
+                    max: 20,
+                    message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
+                },
+                {
+                    type: FormRuleType.Code,
+                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
+                },
+            ],
         },
         {
-            name: DATA_PROVIDER_FIELDS.BASE_URL.key,
-            label: DATA_PROVIDER_FIELDS.BASE_URL.label,
-            ...DATA_PROVIDER_FIELDS.BASE_URL.form,
+            name: 'baseUrl',
+            label: 'URL cơ sở',
+            type: 'input',
+            placeholder: 'https://example.com',
+            rulesConfig: [
+                {
+                    type: FormRuleType.Url,
+                },
+                {
+                    type: FormRuleType.Required,
+                    message: 'Vui lòng nhập URL cơ sở',
+                },
+            ],
         },
     ];
```

---

### 4. `[DELETE]` `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`
> **Action**: Xóa bỏ file constants không còn sử dụng.

---

### 5. `[DELETE]` `src/app/(root)/scraping/data-providers/constants/index.ts`
> **Action**: Xóa bỏ file barrel export của constants.

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx tsc --noEmit` -> **PASS**: Toàn bộ dự án compile sạch 0 lỗi TypeScript.
  - `npm run lint:fix` & `npx eslint src` -> **PASS**: Định dạng và linting hợp lệ 100% (0 errors, 0 warnings).
- **Verification Evidence**:
  ```text
  [PASS] npx tsc --noEmit (exit code: 0)
  [PASS] eslint "**/*.{js,jsx,ts,tsx}" --fix (exit code: 0)
  ```
- **Manual Checks**:
  - `page.tsx` sử dụng hook `useDataProviderPage` tinh gọn, không còn phụ thuộc vào file schema constants.
  - Các modal Tạo mới, Chỉnh sửa, Tự động sinh mã slug, xem chi tiết và xóa nhà cung cấp hoạt động chính xác.
