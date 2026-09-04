---
status: done
slug: data-provider-constants-and-auto-identifier
started_at: 2026-09-04
completed_at: 2026-09-04
pr_url: ~
branch: ~
---

# Plan: Chuẩn hóa Constants & Nút Tự động sinh Identifier cho Data Provider

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- Trong `DataProviderFormModal.tsx` và `page.tsx` (thuộc `src/app/(root)/scraping/data-providers/`), các giá trị `createInitialValues`, `width` cột bảng, và các giới hạn độ dài ký tự (`255`, `20`) đang bị hardcode trực tiếp rải rác trong JSX.
- Trường `identifier` (mã nhà cung cấp) yêu cầu người dùng tự nhập tay chuỗi không dấu, không khoảng trắng, regex `^[a-z0-9-]+$` với độ dài $\le 20$. Chưa có tiện ích hoặc nút thao tác hỗ trợ chuyển đổi tự động từ `name` sang `identifier`.
- **Invariants bắt buộc giữ nguyên**:
  - `identifier` bị vô hiệu hóa (`disabled`) khi ở chế độ chỉnh sửa (`mode === 'edit'`).
  - `rulesConfig` trực quan vẫn được đặt tại component form (`DataProviderFormModal.tsx`) và chỉ tham chiếu các hằng số giới hạn độ dài (`DATA_PROVIDER_LIMITS`).
  - Tuân thủ quy tắc import tương đối trong nội bộ feature page (`../constants`, `../types`).

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Tập trung hóa hằng số (`constants.ts`)**: Tạo file `constants.ts` tại `src/app/(root)/scraping/data-providers/` đóng gói `DATA_PROVIDER_INITIAL_VALUES`, `DATA_PROVIDER_LIMITS`, và `DATA_PROVIDER_COLUMNS_WIDTH`.
- **Tiện ích chuyển đổi Slug (`slugify`)**: Bổ sung hàm `slugify(text, maxLength)` trong `src/libs/string-helper.ts` (export qua `@/libs`), xử lý chuyển đổi Unicode tiếng Việt bỏ dấu, loại bỏ ký tự lạ, chuyển khoảng trắng thành `-`, cắt độ dài tối đa $\le 20$ ký tự và loại bỏ `-` thừa ở 2 đầu.
- **Nút bấm sinh mã tự động (`handleGenerateIdentifier`)**:
  - Tại `DataProviderFormModal.tsx`, thêm nút "Tự động sinh" (kèm icon `ThunderboltOutlined` và Tooltip) vào `addonAfter` của input `identifier` khi `mode === 'create'`.
  - Khi click: Đọc `name` từ `form.getFieldValue('name')` $\rightarrow$ gọi `slugify(name, DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH)` $\rightarrow$ gán giá trị bằng `form.setFieldValue('identifier', generatedSlug)` và kích hoạt validate trường `identifier`.
  - Khi `mode === 'edit'`, không hiển thị nút hoặc nút bị vô hiệu hóa cùng với trường `identifier`.

```mermaid
flowchart TD
    A[DataProviderFormModal: mode === 'create'] --> B[Người dùng nhập name]
    B --> C[Click nút '⚡ Tự động sinh' ở addonAfter]
    C --> D[handleGenerateIdentifier]
    D --> E[form.getFieldValue('name')]
    E --> F[slugify: Bỏ dấu tiếng Việt, ký tự đặc biệt, cắt max 20]
    F --> G[form.setFieldValue('identifier', slug)]
    G --> H[form.validateFields(['identifier'])]
```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/libs/string-helper.ts` | `slugify` | Native JS Regex & String APIs | `None` | `npm run lint` |
| **2** | `[x]` | `[MODIFY]` | `src/libs/index.ts` | Barrel exports | `src/libs/string-helper.ts` | `Order 1` | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/data-providers/constants.ts` | `DATA_PROVIDER_INITIAL_VALUES`, `DATA_PROVIDER_LIMITS`, `DATA_PROVIDER_COLUMNS_WIDTH` | Không | `None` | `npm run lint` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx` | `DataProviderFormModal`, `handleGenerateIdentifier` | `@/components/custom-antd`, `@/libs (slugify)`, `../constants` | `Order 2, 3` | `npm run lint` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/data-providers/page.tsx` | `columns` | `DATA_PROVIDER_COLUMNS_WIDTH` from `../constants` | `Order 3` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/libs/string-helper.ts`
> **Action**: Bổ sung hàm `slugify` xử lý chuẩn hóa ký tự tiếng Việt, loại bỏ ký tự cấm, chuyển thành chữ thường gạch ngang và cắt giới hạn độ dài.

```diff
@@ -22,2 +22,19 @@
 export const formatFileSize = (bytes?: number): string => {
     ...
 };
+
+export const slugify = (text: string, maxLength?: number): string => {
+    if (!text) return '';
+
+    let slug = text
+        .toLowerCase()
+        .normalize('NFD')
+        .replace(/[\u0300-\u036f]/g, '')
+        .replace(/[đĐ]/g, 'd')
+        .replace(/[^a-z0-9\s-]/g, '')
+        .trim()
+        .replace(/[\s_]+/g, '-')
+        .replace(/-+/g, '-');
+
+    if (maxLength && slug.length > maxLength) {
+        slug = slug.substring(0, maxLength);
+    }
+
+    return slug.replace(/^-+|-+$/g, '');
+};
```

### 2. `[MODIFY]` `src/libs/index.ts`
> **Action**: Re-export hàm `slugify` từ `string-helper.ts`.

```diff
@@ -10,2 +10,3 @@
 export * from './object-helper';
-export * from './string-helper';
+export {
+    buildUrl,
+    capitalizeFirstLetter,
+    formatFileSize,
+    slugify,
+} from './string-helper';
```

### 3. `[NEW]` `src/app/(root)/scraping/data-providers/constants.ts`
> **Action**: Tạo file constants tập trung chứa initial values, limits, và column widths.

```typescript
import type { DataProviderFormValues } from './types';

export const DATA_PROVIDER_INITIAL_VALUES: DataProviderFormValues = {
    name: '',
    baseUrl: '',
    identifier: '',
};

export const DATA_PROVIDER_LIMITS = {
    NAME_MAX_LENGTH: 255,
    IDENTIFIER_MAX_LENGTH: 20,
} as const;

export const DATA_PROVIDER_COLUMNS_WIDTH = {
    NAME: '25%',
    IDENTIFIER: '15%',
    BASE_URL: '30%',
    CREATED_AT: '15%',
} as const;
```

### 4. `[MODIFY]` `src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx`
> **Action**: Sử dụng constants `DATA_PROVIDER_INITIAL_VALUES`, `DATA_PROVIDER_LIMITS` và thêm nút bấm tự động sinh identifier qua `addonAfter`.

```diff
@@ -3,10 +3,18 @@
-import { CustomInputForm, CustomModalForm } from '@/components/common';
+import { CustomInputForm, CustomModalForm } from '@/components/common';
+import { CustomButton, CustomTooltip } from '@/components/custom-antd';
 import type { UseCustomModalFormResponse } from '@/hooks';
+import { slugify } from '@/libs';
 import { FormRuleType } from '@/utilities';
+import { ThunderboltOutlined } from '@ant-design/icons';
+import { useCallback } from 'react';
+import {
+    DATA_PROVIDER_INITIAL_VALUES,
+    DATA_PROVIDER_LIMITS,
+} from '../constants';
 import type {
     DataProviderFormValues,
     IDataProvider,
-} from '@/app/(root)/scraping/data-providers/types';
+} from '../types';

@@ -15,4 +23,14 @@
 export const DataProviderFormModal = ({ modalForm }: DataProviderFormModalProps) => {
-    const { mode } = modalForm;
+    const { mode, formProps } = modalForm;
+
+    const handleGenerateIdentifier = useCallback(() => {
+        const form = formProps.form;
+        if (!form) return;
+        const name = form.getFieldValue('name');
+        if (!name) return;
+        const generatedIdentifier = slugify(name, DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH);
+        form.setFieldValue('identifier', generatedIdentifier);
+        form.validateFields(['identifier']);
+    }, [formProps.form]);

     return (
@@ -23,5 +41,1 @@
-            createInitialValues={{
-                name: '',
-                baseUrl: '',
-                identifier: '',
-            }}
+            createInitialValues={DATA_PROVIDER_INITIAL_VALUES}
@@ -36,3 +46,3 @@
                     {
-                        max: 255,
+                        max: DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH,
                         type: FormRuleType.Max,
-                        message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
+                        message: `Tên nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH} ký tự`,
                     },
@@ -48,2 +58,15 @@
                     disabled: mode === 'edit',
                     placeholder: 'Nhập mã nhà cung cấp (vd: shopee)',
+                    addonAfter:
+                        mode === 'create' ? (
+                            <CustomTooltip title="Tự động sinh mã từ tên">
+                                <CustomButton
+                                    type="text"
+                                    size="small"
+                                    className="flex items-center gap-1 font-medium text-hub-primary"
+                                    onClick={handleGenerateIdentifier}
+                                >
+                                    <ThunderboltOutlined />
+                                    Tự động sinh
+                                </CustomButton>
+                            </CustomTooltip>
+                        ) : undefined,
                 }}
@@ -53,3 +76,3 @@
                     {
-                        max: 20,
+                        max: DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
                         type: FormRuleType.Max,
-                        message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
+                        message: `Mã nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH} ký tự`,
                     },
```

### 5. `[MODIFY]` `src/app/(root)/scraping/data-providers/page.tsx`
> **Action**: Thay thế các chuỗi hardcode width trong `columns` bằng `DATA_PROVIDER_COLUMNS_WIDTH`.

```diff
@@ -15,2 +15,3 @@
 import { DataProviderFormModal } from './components';
+import { DATA_PROVIDER_COLUMNS_WIDTH } from './constants';
 import { useDataProviderPage } from './hooks';

@@ -39,1 +40,1 @@
-            width: '25%',
+            width: DATA_PROVIDER_COLUMNS_WIDTH.NAME,
@@ -56,1 +57,1 @@
-            width: '15%',
+            width: DATA_PROVIDER_COLUMNS_WIDTH.IDENTIFIER,
@@ -64,1 +65,1 @@
-            width: '30%',
+            width: DATA_PROVIDER_COLUMNS_WIDTH.BASE_URL,
@@ -72,1 +73,1 @@
-            width: '15%',
+            width: DATA_PROVIDER_COLUMNS_WIDTH.CREATED_AT,
```

## Section 5. Test Cases & Verification
- **Automated Verification**:
  - Chạy `npm run lint` kiểm tra TypeScript compilation và eslint rules.
- **Manual Checks**:
  1. Mở Modal Thêm mới Data Provider (`/scraping/data-providers`).
  2. Nhập "Shopee Việt Nam" vào trường Tên.
  3. Bấm nút "⚡ Tự động sinh" tại trường Mã nhà cung cấp $\rightarrow$ Kiểm tra trường hiển thị "shopee-viet-nam".
  4. Thử với tên dài hơn 20 ký tự (ví dụ: "Cửa hàng thời trang cao cấp Hà Nội") $\rightarrow$ Xác nhận chuỗi sinh ra cắt đúng tối đa 20 ký tự và không lỗi format.
  5. Mở Modal Chỉnh sửa 1 Data Provider $\rightarrow$ Xác nhận trường Mã nhà cung cấp bị disabled và không hiển thị nút tự động sinh mã.
