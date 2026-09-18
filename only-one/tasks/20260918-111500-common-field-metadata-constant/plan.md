---
status: done
slug: common-field-metadata-constant
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn Hóa Common Field Metadata Interface & Constants Cho Form & Table

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Trong `data-providers/page.tsx`, thông tin các field (`name`, `identifier`, `baseUrl`, `createdAt`) đang bị phân mảnh và hardcode chuỗi nhãn ở nhiều nơi độc lập giữa `columns` (Table) và `formFields` (Form).
- Giới hạn độ dài và độ rộng cột đang chia tách thành 2 file riêng biệt (`data-provider-form.constants.ts` và `data-provider-table.constants.ts`), trong khi chuỗi validation message bị hardcode trực tiếp trong JSX.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên API contract và hành vi validation (Required, Max length, URL, Code format).
  - Giữ nguyên tính năng sinh mã tự động (`slugify`) khi nhấn nút "Tự động sinh" ở Create Form.
  - Giữ nguyên đường dẫn routing `/scraping/features/${record.id}` khi click vào link Tên trên bảng.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **`IFieldMetadata<TKey>`** tại `src/interfaces/common.d.ts`:
  ```ts
  export interface IFieldMetadata<TKey extends string = string> {
      key: TKey;
      label: string;
      tableTitle?: string;
      placeholder?: string;
      width?: string | number;
      maxLength?: number;
      minLength?: number;
      requiredMessage?: string;
      messages?: Record<string, string>;
  }
  ```

- **`DATA_PROVIDER_FIELDS`** tại `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`:
  - Định nghĩa Type-Safe Dictionary cho các key của `DataProviderFormValues` và `IDataProvider` (`NAME`, `IDENTIFIER`, `BASE_URL`, `CREATED_AT`).

### AST Seams & Callers
- **`src/interfaces/common.d.ts`**: Thêm interface `IFieldMetadata`.
- **`src/app/(root)/scraping/data-providers/constants/`**:
  - `[NEW]` `data-provider-field.constants.ts`: Định nghĩa `DATA_PROVIDER_FIELDS`.
  - `[DELETE]` `data-provider-form.constants.ts`, `data-provider-table.constants.ts`.
  - `[MODIFY]` `index.ts`: Re-export `data-provider-field.constants`.
- **`src/app/(root)/scraping/data-providers/page.tsx`**:
  - Refactor `columns`: Dùng `DATA_PROVIDER_FIELDS.*.key`, `tableTitle ?? label`, `width`.
  - Refactor `formFields`: Dùng `DATA_PROVIDER_FIELDS.*.key`, `label`, `placeholder`, `requiredMessage`, `maxLength`.
  - Refactor `filters`: Dùng `DATA_PROVIDER_FIELDS.NAME.label` cho search placeholder.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   └── [MODIFY] common.d.ts                                # Thêm interface IFieldMetadata
└── app/(root)/scraping/data-providers/
    ├── constants/
    │   ├── [NEW]    data-provider-field.constants.ts       # Single Source of Truth chứa metadata fields
    │   ├── [DELETE] data-provider-form.constants.ts        # Xóa do đã gộp vào field constants
    │   ├── [DELETE] data-provider-table.constants.ts       # Xóa do đã gộp vào field constants
    │   └── [MODIFY] index.ts                               # Export data-provider-field.constants
    └── [MODIFY] page.tsx                                   # Tích hợp DATA_PROVIDER_FIELDS vào Table & Form
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/common.d.ts` | `interface IFieldMetadata` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts` | `const DATA_PROVIDER_FIELDS` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/data-providers/constants/data-provider-form.constants.ts` | `DATA_PROVIDER_LIMITS` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/data-providers/constants/data-provider-table.constants.ts` | `DATA_PROVIDER_COLUMNS_WIDTH` | `Order 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/constants/index.ts` | `export * from './data-provider-field.constants'` | `Order 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `columns, formFields, filters` | `Order 5` | `npx eslint src/app/(root)/scraping/data-providers/ && npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/common.d.ts`
> **Action**: Khai báo interface `IFieldMetadata` dùng chung cho toàn bộ dự án.

```diff
@@ line 30 @@
+export interface IFieldMetadata<TKey extends string = string> {
+    key: TKey;
+    label: string;
+    tableTitle?: string;
+    placeholder?: string;
+    width?: string | number;
+    maxLength?: number;
+    minLength?: number;
+    requiredMessage?: string;
+    messages?: Record<string, string>;
+}
+
 export interface Option<T = string | number> {
```

---

### 2. `[NEW]` `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`
> **Action**: Khởi tạo hằng số `DATA_PROVIDER_FIELDS` quản lý metadata toàn diện của Data Provider.

```ts
import type { IFieldMetadata } from '@/interfaces';

export const DATA_PROVIDER_FIELDS = {
    NAME: {
        key: 'name',
        label: 'Tên nhà cung cấp',
        tableTitle: 'Tên',
        placeholder: 'Nhập tên nhà cung cấp',
        maxLength: 255,
        width: '25%',
        requiredMessage: 'Vui lòng nhập tên nhà cung cấp',
    },
    IDENTIFIER: {
        key: 'identifier',
        label: 'Mã nhà cung cấp',
        tableTitle: 'Mã',
        placeholder: 'Nhập mã nhà cung cấp',
        maxLength: 20,
        width: '15%',
        requiredMessage: 'Vui lòng nhập mã nhà cung cấp',
        messages: {
            code: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
        },
    },
    BASE_URL: {
        key: 'baseUrl',
        label: 'URL cơ sở',
        tableTitle: 'URL cơ sở',
        placeholder: 'https://example.com',
        width: '30%',
        requiredMessage: 'Vui lòng nhập URL cơ sở',
    },
    CREATED_AT: {
        key: 'createdAt',
        label: 'Ngày tạo',
        tableTitle: 'Ngày tạo',
        width: '15%',
    },
} as const satisfies Record<string, IFieldMetadata>;
```

---

### 3. `[DELETE]` `src/app/(root)/scraping/data-providers/constants/data-provider-form.constants.ts`
> **Action**: Xóa file do `DATA_PROVIDER_LIMITS` đã được chuyển vào `DATA_PROVIDER_FIELDS.*.maxLength`.

---

### 4. `[DELETE]` `src/app/(root)/scraping/data-providers/constants/data-provider-table.constants.ts`
> **Action**: Xóa file do `DATA_PROVIDER_COLUMNS_WIDTH` đã được chuyển vào `DATA_PROVIDER_FIELDS.*.width`.

---

### 5. `[MODIFY]` `src/app/(root)/scraping/data-providers/constants/index.ts`
> **Action**: Cập nhật export từ `data-provider-field.constants`.

```diff
-export * from './data-provider-form.constants';
-export * from './data-provider-table.constants';
+export * from './data-provider-field.constants';
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/data-providers/page.tsx`
> **Action**: Thay thế các chuỗi hardcode và hằng số cũ bằng `DATA_PROVIDER_FIELDS`.

```diff
@@ line 17 @@
-import { DATA_PROVIDER_COLUMNS_WIDTH, DATA_PROVIDER_LIMITS } from './constants';
+import { DATA_PROVIDER_FIELDS } from './constants';
 import type { DataProviderFormValues, IDataProvider } from './types';
@@ line 52 @@
     const columns: ColumnsType<IDataProvider> = [
         {
-            title: 'Tên',
-            dataIndex: 'name',
-            key: 'name',
+            title: DATA_PROVIDER_FIELDS.NAME.tableTitle,
+            dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
+            key: DATA_PROVIDER_FIELDS.NAME.key,
             ellipsis: true,
             sorter: true,
-            width: DATA_PROVIDER_COLUMNS_WIDTH.NAME,
+            width: DATA_PROVIDER_FIELDS.NAME.width,
             render: (name: string, record) => (
                 <CustomButton
                     type="link"
                     className="p-0 font-medium text-hub-primary hover:underline"
                     onClick={() => router.push(`/scraping/features/${record.id}`)}
                 >
                     {name}
                 </CustomButton>
             ),
         },
         {
-            title: 'Mã',
-            dataIndex: 'identifier',
-            key: 'identifier',
+            title: DATA_PROVIDER_FIELDS.IDENTIFIER.tableTitle,
+            dataIndex: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
+            key: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
             ellipsis: true,
             sorter: true,
-            width: DATA_PROVIDER_COLUMNS_WIDTH.IDENTIFIER,
+            width: DATA_PROVIDER_FIELDS.IDENTIFIER.width,
         },
         {
-            title: 'URL cơ sở',
-            dataIndex: 'baseUrl',
-            key: 'baseUrl',
+            title: DATA_PROVIDER_FIELDS.BASE_URL.tableTitle,
+            dataIndex: DATA_PROVIDER_FIELDS.BASE_URL.key,
+            key: DATA_PROVIDER_FIELDS.BASE_URL.key,
             ellipsis: true,
             sorter: true,
-            width: DATA_PROVIDER_COLUMNS_WIDTH.BASE_URL,
+            width: DATA_PROVIDER_FIELDS.BASE_URL.width,
         },
         {
-            title: 'Ngày tạo',
-            dataIndex: 'createdAt',
-            key: 'createdAt',
+            title: DATA_PROVIDER_FIELDS.CREATED_AT.tableTitle,
+            dataIndex: DATA_PROVIDER_FIELDS.CREATED_AT.key,
+            key: DATA_PROVIDER_FIELDS.CREATED_AT.key,
             sorter: true,
             render: (createdAt: Date) => formatDate(createdAt),
-            width: DATA_PROVIDER_COLUMNS_WIDTH.CREATED_AT,
+            width: DATA_PROVIDER_FIELDS.CREATED_AT.width,
         },
     ];
@@ line 118 @@
         {
             name: 'search',
             type: 'input',
             isPrimary: true,
-            placeholder: 'Tìm kiếm theo tên nhà cung cấp',
+            placeholder: `Tìm kiếm theo ${DATA_PROVIDER_FIELDS.NAME.label.toLowerCase()}`,
             onChange: (value) => debouncedSearch(value?.toString() ?? ''),
         },
@@ line 123 @@
     const formFields: IFormField<DataProviderFormValues>[] = [
         {
-            name: 'name',
+            name: DATA_PROVIDER_FIELDS.NAME.key,
             type: 'input',
-            label: 'Tên nhà cung cấp',
-            placeholder: 'Nhập tên nhà cung cấp',
+            label: DATA_PROVIDER_FIELDS.NAME.label,
+            placeholder: DATA_PROVIDER_FIELDS.NAME.placeholder,
             rulesConfig: [
-                { type: FormRuleType.Required, message: 'Vui lòng nhập tên nhà cung cấp' },
+                {
+                    type: FormRuleType.Required,
+                    message: DATA_PROVIDER_FIELDS.NAME.requiredMessage,
+                },
                 {
                     type: FormRuleType.Max,
-                    max: DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH,
-                    message: `Tên nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH} ký tự`,
+                    max: DATA_PROVIDER_FIELDS.NAME.maxLength,
+                    message: `${DATA_PROVIDER_FIELDS.NAME.label} không được vượt quá ${DATA_PROVIDER_FIELDS.NAME.maxLength} ký tự`,
                 },
             ],
         },
         {
-            name: 'identifier',
+            name: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
             type: 'input',
-            label: 'Mã nhà cung cấp',
-            placeholder: 'Nhập mã nhà cung cấp',
+            label: DATA_PROVIDER_FIELDS.IDENTIFIER.label,
+            placeholder: DATA_PROVIDER_FIELDS.IDENTIFIER.placeholder,
             disabled: (mode: FormMode) => mode === 'edit',
             addonAfter: (form, mode: FormMode) =>
                 mode === 'create' ? (
                     <CustomButton
                         type="text"
                         size="small"
                         onClick={() => {
                             if (!form) return;
-                            const currentName = form.getFieldValue('name');
+                            const currentName = form.getFieldValue(DATA_PROVIDER_FIELDS.NAME.key);
                             if (currentName) {
                                 form.setFieldValue(
-                                    'identifier',
+                                    DATA_PROVIDER_FIELDS.IDENTIFIER.key,
                                     slugify(
                                         currentName,
-                                        DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
+                                        DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength,
                                     ),
                                 );
-                                form.validateFields(['identifier']);
+                                form.validateFields([DATA_PROVIDER_FIELDS.IDENTIFIER.key]);
                             }
                         }}
                         className="flex items-center gap-1 font-medium text-hub-primary"
                     >
                         <ThunderboltOutlined />
                         Tự động sinh
                     </CustomButton>
                 ) : undefined,
             rulesConfig: [
-                { type: FormRuleType.Required, message: 'Vui lòng nhập mã nhà cung cấp' },
+                {
+                    type: FormRuleType.Required,
+                    message: DATA_PROVIDER_FIELDS.IDENTIFIER.requiredMessage,
+                },
                 {
                     type: FormRuleType.Max,
-                    max: DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
-                    message: `Mã nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH} ký tự`,
+                    max: DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength,
+                    message: `${DATA_PROVIDER_FIELDS.IDENTIFIER.label} không được vượt quá ${DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength} ký tự`,
                 },
                 {
                     type: FormRuleType.Code,
-                    message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
+                    message: DATA_PROVIDER_FIELDS.IDENTIFIER.messages?.code,
                 },
             ],
         },
         {
-            name: 'baseUrl',
+            name: DATA_PROVIDER_FIELDS.BASE_URL.key,
             type: 'input',
-            label: 'URL cơ sở',
-            placeholder: 'https://example.com',
+            label: DATA_PROVIDER_FIELDS.BASE_URL.label,
+            placeholder: DATA_PROVIDER_FIELDS.BASE_URL.placeholder,
             rulesConfig: [
                 { type: FormRuleType.Url },
-                { type: FormRuleType.Required, message: 'Vui lòng nhập URL cơ sở' },
+                {
+                    type: FormRuleType.Required,
+                    message: DATA_PROVIDER_FIELDS.BASE_URL.requiredMessage,
+                },
             ],
         },
     ];
```

## Section 5. Test Cases & Verification
- **Automated Tests**:
  - `npx eslint src/app/(root)/scraping/data-providers/ src/interfaces/`
  - `npx tsc --noEmit`
- **Manual Checks**:
  - Mở trang `/scraping/data-providers`: Bảng hiển thị đầy đủ các cột Tên, Mã, URL cơ sở, Ngày tạo đúng độ rộng.
  - Mở modal Thêm mới: Các nhãn và placeholder hiển thị đúng. Nhập tên và click "Tự động sinh" -> Mã được sinh ra slugify chính xác.
  - Thử validate lỗi: Bỏ trống hoặc nhập quá độ dài max -> hiển thị đúng thông báo lỗi từ constant.
