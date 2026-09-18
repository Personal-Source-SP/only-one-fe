---
status: done
slug: field-metadata-rules-config
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Tách và Chuẩn hóa Validation Rules trong IFieldMetadata với FormRuleConfig

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**: Interface [`IFieldMetadata`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts#L11-L21) đang kết hợp cả thuộc tính UI display (`key`, `label`, `tableTitle`, `placeholder`, `width`) lẫn các ràng buộc validation rời rạc (`maxLength`, `minLength`, `requiredMessage`, `messages`).
- **Điểm nghẽn & Code duplication**: Tại [`data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts) và [`page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx#L123-L198), lập trình viên phải khai báo lại mảng `rulesConfig` thủ công, map từng field rời rạc sang enum [`FormRuleType`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/form-rules.ts#L3-L12).
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên toàn bộ typing và runtime behavior của engine [`buildFormRules`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/utilities/form-rules.ts#L78) và [`IFormField`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/types.ts#L75).
  - Đảm bảo không phát sinh circular dependency khi import `type { FormRuleConfig }` từ `@/utilities` vào `src/interfaces/common.ts`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### Type Signatures & Code Contracts
- **Interface [`IFieldMetadata`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts)**:
  ```typescript
  import type { FormRuleConfig } from '@/utilities';

  export interface IFieldMetadata<TKey extends string = string> {
      key: TKey;
      label: string;
      tableTitle?: string;
      placeholder?: string;
      width?: string | number;
      rulesConfig?: FormRuleConfig[];
  }
  ```

### AST Seams & Callers
1. [`src/interfaces/common.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts):
   - Loại bỏ các optional fields: `maxLength`, `minLength`, `requiredMessage`, `messages`.
   - Thêm `rulesConfig?: FormRuleConfig[]`.
2. [`src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts):
   - Chuyển đổi định nghĩa `NAME`, `IDENTIFIER`, `BASE_URL` sang sử dụng `rulesConfig: FormRuleConfig[]` với `FormRuleType`.
3. [`src/app/(root)/scraping/data-providers/page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx):
   - Thay thế việc khởi tạo thủ công mảng `rulesConfig` trong `formFields` bằng cách truyền trực tiếp `DATA_PROVIDER_FIELDS.<FIELD>.rulesConfig`.
   - Loại bỏ import không còn sử dụng `FormRuleType`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes
```text
src/
├── interfaces/
│   └── [MODIFY] common.ts                                                # Chuẩn hóa IFieldMetadata với rulesConfig?: FormRuleConfig[]
└── app/(root)/scraping/data-providers/
    ├── constants/
    │   └── [MODIFY] data-provider-field.constants.ts                    # Khai báo rulesConfig trực tiếp trong DATA_PROVIDER_FIELDS
    └── [MODIFY] page.tsx                                                 # Tái sử dụng DATA_PROVIDER_FIELDS.<FIELD>.rulesConfig
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/common.ts` | `IFieldMetadata` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts` | `DATA_PROVIDER_FIELDS` | `Order 1` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `DataProviderPage.formFields` | `Order 2` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` [`src/interfaces/common.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/interfaces/common.ts)
> **Action**: Import `FormRuleConfig` và cập nhật `IFieldMetadata` để sử dụng `rulesConfig?: FormRuleConfig[]`, loại bỏ các thuộc tính validation lẻ.

```diff
@@ -1,3 +1,5 @@
+import type { FormRuleConfig } from '@/utilities';
+
 export interface IAbstract {
     id: string;
     createdAt?: Date;
@@ -14,10 +16,7 @@
     tableTitle?: string;
     placeholder?: string;
     width?: string | number;
-    maxLength?: number;
-    minLength?: number;
-    requiredMessage?: string;
-    messages?: Record<string, string>;
+    rulesConfig?: FormRuleConfig[];
 }
 
 export interface IOption<T = string | number> {
```

---

### 2. `[MODIFY]` [`src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/constants/data-provider-field.constants.ts)
> **Action**: Khai báo validation rules trực tiếp qua thuộc tính `rulesConfig` với `FormRuleType`.

```diff
@@ -1,4 +1,5 @@
 import type { IFieldMetadata } from '@/interfaces';
+import { FormRuleType } from '@/utilities';
 
 export const DATA_PROVIDER_FIELDS = {
     NAME: {
@@ -6,10 +7,17 @@
         label: 'Tên nhà cung cấp',
         tableTitle: 'Tên',
         placeholder: 'Nhập tên nhà cung cấp',
-        maxLength: 255,
         width: '25%',
-        requiredMessage: 'Vui lòng nhập tên nhà cung cấp',
+        rulesConfig: [
+            {
+                type: FormRuleType.Required,
+                message: 'Vui lòng nhập tên nhà cung cấp',
+            },
+            {
+                type: FormRuleType.Max,
+                max: 255,
+                message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
+            },
+        ],
     },
     IDENTIFIER: {
@@ -15,13 +23,20 @@
         label: 'Mã nhà cung cấp',
         tableTitle: 'Mã',
         placeholder: 'Nhập mã nhà cung cấp',
-        maxLength: 20,
         width: '15%',
-        requiredMessage: 'Vui lòng nhập mã nhà cung cấp',
-        messages: {
-            code: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
-        },
+        rulesConfig: [
+            {
+                type: FormRuleType.Required,
+                message: 'Vui lòng nhập mã nhà cung cấp',
+            },
+            {
+                type: FormRuleType.Max,
+                max: 20,
+                message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
+            },
+            {
+                type: FormRuleType.Code,
+                message: 'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
+            },
+        ],
     },
     BASE_URL: {
@@ -27,7 +42,13 @@
         label: 'URL cơ sở',
         tableTitle: 'URL cơ sở',
         placeholder: 'https://example.com',
         width: '30%',
-        requiredMessage: 'Vui lòng nhập URL cơ sở',
+        rulesConfig: [
+            { type: FormRuleType.Url },
+            {
+                type: FormRuleType.Required,
+                message: 'Vui lòng nhập URL cơ sở',
+            },
+        ],
     },
     CREATED_AT: {
```

---

### 3. `[MODIFY]` [`src/app/(root)/scraping/data-providers/page.tsx`](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx)
> **Action**: Sử dụng trực tiếp `rulesConfig` từ `DATA_PROVIDER_FIELDS` và loại bỏ import `FormRuleType`.

```diff
@@ -11,7 +11,6 @@
 import type { FormMode } from '@/hooks';
 import { useCustomModalForm, useCustomTable } from '@/hooks';
 import { formatDate, slugify } from '@/libs';
-import { FormRuleType } from '@/utilities';
 import { PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
 import { useRouter } from 'next/navigation';
 import { DATA_PROVIDER_FIELDS } from './constants';
@@ -126,17 +125,7 @@
             name: DATA_PROVIDER_FIELDS.NAME.key,
             type: 'input',
             label: DATA_PROVIDER_FIELDS.NAME.label,
             placeholder: DATA_PROVIDER_FIELDS.NAME.placeholder,
-            rulesConfig: [
-                {
-                    type: FormRuleType.Required,
-                    message: DATA_PROVIDER_FIELDS.NAME.requiredMessage,
-                },
-                {
-                    type: FormRuleType.Max,
-                    max: DATA_PROVIDER_FIELDS.NAME.maxLength,
-                    message: `${DATA_PROVIDER_FIELDS.NAME.label} không được vượt quá ${DATA_PROVIDER_FIELDS.NAME.maxLength} ký tự`,
-                },
-            ],
+            rulesConfig: DATA_PROVIDER_FIELDS.NAME.rulesConfig,
         },
         {
@@ -155,7 +144,7 @@
                             if (currentName) {
                                 form.setFieldValue(
                                     DATA_PROVIDER_FIELDS.IDENTIFIER.key,
-                                    slugify(currentName, DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength),
+                                    slugify(currentName, 20),
                                 );
                                 form.validateFields([DATA_PROVIDER_FIELDS.IDENTIFIER.key]);
                             }
@@ -166,21 +155,7 @@
                         Tự động sinh
                     </CustomButton>
                 ) : undefined,
-            rulesConfig: [
-                {
-                    type: FormRuleType.Required,
-                    message: DATA_PROVIDER_FIELDS.IDENTIFIER.requiredMessage,
-                },
-                {
-                    type: FormRuleType.Max,
-                    max: DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength,
-                    message: `${DATA_PROVIDER_FIELDS.IDENTIFIER.label} không được vượt quá ${DATA_PROVIDER_FIELDS.IDENTIFIER.maxLength} ký tự`,
-                },
-                {
-                    type: FormRuleType.Code,
-                    message: DATA_PROVIDER_FIELDS.IDENTIFIER.messages?.code,
-                },
-            ],
+            rulesConfig: DATA_PROVIDER_FIELDS.IDENTIFIER.rulesConfig,
         },
         {
             name: DATA_PROVIDER_FIELDS.BASE_URL.key,
@@ -188,13 +163,7 @@
             label: DATA_PROVIDER_FIELDS.BASE_URL.label,
             placeholder: DATA_PROVIDER_FIELDS.BASE_URL.placeholder,
-            rulesConfig: [
-                { type: FormRuleType.Url },
-                {
-                    type: FormRuleType.Required,
-                    message: DATA_PROVIDER_FIELDS.BASE_URL.requiredMessage,
-                },
-            ],
+            rulesConfig: DATA_PROVIDER_FIELDS.BASE_URL.rulesConfig,
         },
     ];
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- [x] `npm run build`: PASS (TypeScript type checking, static pages generation 30/30, bundle optimization successful).
- [x] `npx eslint "src/**/*.{js,jsx,ts,tsx}"`: PASS (0 errors, 0 warnings).

### Manual Checks
1. [x] Kiểm tra type-checking TypeScript không phát sinh lỗi interface signature.
2. [x] Kiểm tra form tạo mới / chỉnh sửa Nhà cung cấp (`/scraping/data-providers`):
   - Validate field **Tên nhà cung cấp**: Required, Max 255 ký tự.
   - Validate field **Mã nhà cung cấp**: Required, Max 20 ký tự, định dạng code (`^[a-z0-9-]+$`).
   - Validate field **URL cơ sở**: Required, URL format (không chứa trailing slash, không chứa www).
   - Nút **Tự động sinh** mã hoạt động chính xác với độ dài tối đa 20 ký tự.
