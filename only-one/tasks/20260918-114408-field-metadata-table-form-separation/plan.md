---
status: done
slug: field-metadata-table-form-separation
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Phân tách Cấu trúc IFieldMetadata thành Base, Table, Form và Dùng Spread Operator

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**: Interface [`IFieldMetadata`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts#L13-L20) chứa các thuộc tính Table và Form phẳng ở cấp root.
- **Mục tiêu cải tiến**:
  - Tách `IFieldMetadata` thành các cấu trúc con `table?: IFieldTableConfig` và `form?: IFieldFormConfig`.
  - Giữ nguyên cấu trúc thư mục [`constants/`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/) truyền thống.
  - Sử dụng cú pháp **Spread Operator (`...`)** tiện lợi trong [`page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx) cho cả Table columns và Form fields.
- **Invariants bắt buộc duy trì**:
  - `table?: IFieldTableConfig` và `form?: IFieldFormConfig` là optional.
  - Hỗ trợ đầy đủ các props cần thiết (`type`, `rulesConfig`, `placeholder`, `colSpan`, `title`, `width`, `sorter`, `ellipsis`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **Interfaces trong [`src/interfaces/common.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts)**:
  ```typescript
  import type { FormRuleConfig } from '@/utilities';

  export type FormFieldType =
      | 'input'
      | 'number'
      | 'password'
      | 'textarea'
      | 'select'
      | 'switch'
      | 'custom';

  export interface IFieldTableConfig {
      title?: string;
      width?: string | number;
      sorter?: boolean;
      ellipsis?: boolean;
      hidden?: boolean;
  }

  export interface IFieldFormConfig {
      type?: FormFieldType;
      placeholder?: string;
      rulesConfig?: FormRuleConfig[];
      colSpan?: number;
  }

  export interface IFieldMetadata<TKey extends string = string> {
      key: TKey;
      label: string;
      description?: string;
      table?: IFieldTableConfig;
      form?: IFieldFormConfig;
  }
  ```

### AST Seams & Callers
1. [`src/interfaces/common.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts):
   - Export `FormFieldType`, `IFieldTableConfig`, `IFieldFormConfig` và cập nhật `IFieldMetadata`.
2. [`src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts):
   - Cập nhật định nghĩa `DATA_PROVIDER_FIELDS` sử dụng `table: { ... }` và `form: { ... }`.
3. [`src/app/(root)/scraping/data-providers/page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx):
   - Sử dụng spread `...DATA_PROVIDER_FIELDS.<FIELD>.table` trong `columns`.
   - Sử dụng spread `...DATA_PROVIDER_FIELDS.<FIELD>.form` trong `formFields`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── interfaces/
│   └── [MODIFY] common.ts                                                # Khai báo IFieldTableConfig, IFieldFormConfig và IFieldMetadata
└── app/(root)/scraping/data-providers/
    ├── constants/
    │   └── [MODIFY] data-provider-field.constants.ts                    # Cấu trúc lại DATA_PROVIDER_FIELDS với table/form sub-configs
    └── [MODIFY] page.tsx                                                 # Dùng spread operator cho columns và formFields
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/common.ts` | `IFieldTableConfig`, `IFieldFormConfig`, `IFieldMetadata` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts` | `DATA_PROVIDER_FIELDS` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `columns`, `formFields` | `Order 2` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` [`src/interfaces/common.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts)
> **Action**: Khai báo `IFieldTableConfig`, `IFieldFormConfig` và cập nhật `IFieldMetadata`.

```diff
@@ -1,3 +1,4 @@
+import type { FormFieldType } from '@/components/common/forms/custom-form-field/types';
 import type { FormRuleConfig } from '@/utilities';
 
 export interface IAbstract {
@@ -10,13 +11,26 @@
     deletedAt?: Date | null;
 }
 
+export interface IFieldTableConfig {
+    title?: string;
+    width?: string | number;
+    sorter?: boolean;
+    ellipsis?: boolean;
+    hidden?: boolean;
+}
+
+export interface IFieldFormConfig {
+    type?: FormFieldType;
+    placeholder?: string;
+    rulesConfig?: FormRuleConfig[];
+    colSpan?: number;
+}
+
 export interface IFieldMetadata<TKey extends string = string> {
     key: TKey;
     label: string;
-    tableTitle?: string;
-    placeholder?: string;
-    width?: string | number;
-    rulesConfig?: FormRuleConfig[];
+    description?: string;
+    table?: IFieldTableConfig;
+    form?: IFieldFormConfig;
 }
 
 export interface IOption<T = string | number> {
```

---

### 2. `[MODIFY]` [`src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts)
> **Action**: Cấu trúc lại các trường trong `DATA_PROVIDER_FIELDS` với `table` và `form` sub-objects.

```diff
@@ -6,64 +6,79 @@
     NAME: {
         key: 'name',
         label: 'Tên nhà cung cấp',
-        width: '25%',
-        rulesConfig: [
-            {
-                type: FormRuleType.Required,
-                message: 'Vui lòng nhập tên nhà cung cấp',
-            },
-            {
-                type: FormRuleType.Max,
-                max: 255,
-                message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
-            },
-        ],
+        table: {
+            title: 'Tên',
+            width: '25%',
+            sorter: true,
+            ellipsis: true,
+        },
+        form: {
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
+                    message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
+                },
+            ],
+        },
     },
     IDENTIFIER: {
         key: 'identifier',
         label: 'Mã nhà cung cấp',
-        width: '15%',
-        rulesConfig: [
-            {
-                type: FormRuleType.Required,
-                message: 'Vui lòng nhập mã nhà cung cấp',
-            },
-            {
-                type: FormRuleType.Max,
-                max: 20,
-                message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
-            },
-            {
-                type: FormRuleType.Code,
-                message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
-            },
-        ],
+        table: {
+            title: 'Mã',
+            width: '15%',
+            sorter: true,
+            ellipsis: true,
+        },
+        form: {
+            type: 'input',
+            placeholder: 'Nhập mã nhà cung cấp',
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
+        },
     },
     BASE_URL: {
         key: 'baseUrl',
         label: 'URL cơ sở',
-        width: '30%',
-        rulesConfig: [
-            {
-                type: FormRuleType.Url,
-            },
-            {
-                type: FormRuleType.Required,
-                message: 'Vui lòng nhập URL cơ sở',
-            },
-        ],
+        table: {
+            title: 'URL cơ sở',
+            width: '30%',
+            sorter: true,
+            ellipsis: true,
+        },
+        form: {
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
+        },
     },
     CREATED_AT: {
         key: 'createdAt',
         label: 'Ngày tạo',
-        width: '15%',
+        table: {
+            title: 'Ngày tạo',
+            width: '15%',
+            sorter: true,
+        },
     },
 } as const satisfies Record<string, IFieldMetadata>;
```

---

### 3. `[MODIFY]` [`src/app/(root)/scraping/data-providers/page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx)
> **Action**: Áp dụng spread operator cho `columns` và `formFields`.

```diff
@@ -52,11 +52,9 @@
     const columns: ColumnsType<IDataProvider> = [
         {
-            title: DATA_PROVIDER_FIELDS.NAME.tableTitle,
+            title: DATA_PROVIDER_FIELDS.NAME.table?.title ?? DATA_PROVIDER_FIELDS.NAME.label,
             dataIndex: DATA_PROVIDER_FIELDS.NAME.key,
             key: DATA_PROVIDER_FIELDS.NAME.key,
-            ellipsis: true,
-            sorter: true,
-            width: DATA_PROVIDER_FIELDS.NAME.width,
+            ...DATA_PROVIDER_FIELDS.NAME.table,
             render: (name: string, record) => (
                 <CustomButton
                     type="link"
@@ -69,24 +67,19 @@
         },
         {
-            title: DATA_PROVIDER_FIELDS.IDENTIFIER.tableTitle,
+            title: DATA_PROVIDER_FIELDS.IDENTIFIER.table?.title ?? DATA_PROVIDER_FIELDS.IDENTIFIER.label,
             dataIndex: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
             key: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-            ellipsis: true,
-            sorter: true,
-            width: DATA_PROVIDER_FIELDS.IDENTIFIER.width,
+            ...DATA_PROVIDER_FIELDS.IDENTIFIER.table,
         },
         {
-            title: DATA_PROVIDER_FIELDS.BASE_URL.tableTitle,
+            title: DATA_PROVIDER_FIELDS.BASE_URL.table?.title ?? DATA_PROVIDER_FIELDS.BASE_URL.label,
             dataIndex: DATA_PROVIDER_FIELDS.BASE_URL.key,
             key: DATA_PROVIDER_FIELDS.BASE_URL.key,
-            ellipsis: true,
-            sorter: true,
-            width: DATA_PROVIDER_FIELDS.BASE_URL.width,
+            ...DATA_PROVIDER_FIELDS.BASE_URL.table,
         },
         {
-            title: DATA_PROVIDER_FIELDS.CREATED_AT.tableTitle,
+            title: DATA_PROVIDER_FIELDS.CREATED_AT.table?.title ?? DATA_PROVIDER_FIELDS.CREATED_AT.label,
             dataIndex: DATA_PROVIDER_FIELDS.CREATED_AT.key,
             key: DATA_PROVIDER_FIELDS.CREATED_AT.key,
-            sorter: true,
+            ...DATA_PROVIDER_FIELDS.CREATED_AT.table,
             render: (createdAt: Date) => formatDate(createdAt),
-            width: DATA_PROVIDER_FIELDS.CREATED_AT.width,
         },
     ];
@@ -124,14 +117,12 @@
     const formFields: IFormField<DataProviderFormValues>[] = [
         {
             name: DATA_PROVIDER_FIELDS.NAME.key,
-            type: 'input',
             label: DATA_PROVIDER_FIELDS.NAME.label,
-            placeholder: DATA_PROVIDER_FIELDS.NAME.placeholder,
-            rulesConfig: DATA_PROVIDER_FIELDS.NAME.rulesConfig,
+            ...DATA_PROVIDER_FIELDS.NAME.form,
         },
         {
             name: DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-            type: 'input',
             label: DATA_PROVIDER_FIELDS.IDENTIFIER.label,
-            placeholder: DATA_PROVIDER_FIELDS.IDENTIFIER.placeholder,
             disabled: (mode: FormMode) => mode === 'edit',
@@ -154,7 +145,7 @@
                     </CustomButton>
                 ) : undefined,
-            rulesConfig: DATA_PROVIDER_FIELDS.IDENTIFIER.rulesConfig,
+            ...DATA_PROVIDER_FIELDS.IDENTIFIER.form,
         },
         {
             name: DATA_PROVIDER_FIELDS.BASE_URL.key,
-            type: 'input',
             label: DATA_PROVIDER_FIELDS.BASE_URL.label,
-            placeholder: DATA_PROVIDER_FIELDS.BASE_URL.placeholder,
-            rulesConfig: DATA_PROVIDER_FIELDS.BASE_URL.rulesConfig,
+            ...DATA_PROVIDER_FIELDS.BASE_URL.form,
         },
     ];
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- [x] `npm run build`: PASS (TypeScript type checking, static pages generation 30/30, bundle optimization successful).
- [x] `npx eslint "src/**/*.{js,jsx,ts,tsx}"`: PASS (0 errors, 0 warnings).

### Manual Checks
1. [x] Kiểm tra type-checking TypeScript pass 100%.
2. [x] Giữ nguyên cấu trúc thư mục `constants/`.
3. [x] Table columns và Form fields trong `page.tsx` render chính xác và ngắn gọn với spread operator.
