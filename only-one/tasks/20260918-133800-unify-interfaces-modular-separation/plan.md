---
status: done
slug: unify-interfaces-modular-separation
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Đồng nhất & Chuẩn hóa Hệ thống Interfaces & Hợp nhất Form Modal Containers

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Phân mảnh Form Modal Layout**: Thư mục legacy `form-modal-layout` chứa `CreateFormDialog`, `EditFormDialog`, `FormFields`, `FormModalLayout` không còn được các trang CRUD sử dụng nhưng vẫn tồn tại song song với container chuẩn `form-modal-container` (`FormModalContainer`). Hai màn hình wizard (`ImportData.tsx`, `ProcessScrapeData.tsx`) vẫn bọc qua wrapper cũ `FormModalLayout`.
- **Rác Interface trong `component.ts`**: `IFormFieldItem` cùng 6 interface phụ trợ (`IFormFieldItemCodeProps`, `IFormFieldItemInputProps`, `IFormFieldItemSelectProps`, `IFormFieldItemSwitchProps`, `IFormFieldItemTextareaProps`, `IFormFieldItemUploadProps`) chỉ phục vụ riêng cho `form-modal-layout` đã bị bỏ rơi.
- **Phân mảnh Filter Interfaces**: `filter.ts` chứa interface cũ `IFilterItem`, trong khi `containers.ts` lại tự định nghĩa bộ type filter hiện đại (`IFilterField`, `FilterType`, `FilterValue`, `IFilterOption`) phục vụ `FilterPanel` và hơn 15 trang.
- **Lệch vị trí Primitive Type `IOption`**: `IOption` đang nằm ở `forms.ts`, tạo ra phụ thuộc chéo bất hợp lý từ `component.ts`, `filter.ts`, và `containers.ts` vào `forms.ts`.
- **Invariants bắt buộc duy trì**:
  - Không phá vỡ runtime behavior của các trang CRUD sử dụng `FormModalContainer` và `ListContainer`.
  - Giữ nguyên giao diện và luồng nhiều bước (multi-step wizard) tại `ImportData.tsx` và `ProcessScrapeData.tsx`.
  - Duy trì backward compatibility thông qua barrel export tại `src/interfaces/index.ts` và `src/components/common/index.ts`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  1. `src/interfaces/component.ts`:
     - Khai báo primitive `IOption<TValue = string | number, TLabel = ReactNode> { value: TValue; label: TLabel; key?: string; }`.
     - Xóa bỏ hoàn toàn `IFormFieldItem` và các props liên quan.
  2. `src/interfaces/forms.ts`:
     - Import `IOption` từ `./component`.
     - Giữ nguyên `FormFieldType`, `IFieldFormConfig`, `IBaseFormField`, `IFormField` cùng các form field union subtypes.
  3. `src/interfaces/filter.ts`:
     - Trở thành Single Source of Truth cho Filter system: chứa `FilterType`, `FilterValue`, `IFilterOption`, `IFilterField`, và giữ `IFilterItem` cho backward-compatibility.
  4. `src/interfaces/containers.ts`:
     - Nhận `IFieldFormConfig` từ `./forms` và `IFilterField`, `FilterValue`, `FilterType`, `IFilterOption` từ `./filter`.
     - Quản lý Table (`IFieldTableConfig`, `ITableCustomAction`), Layout/Header (`IBreadcrumbItem`, `ICardAction`), và Metadata (`IFieldMetadata`).
- **AST Seams & Callers**:
  - `src/components/common/index.ts`: Gỡ bỏ dòng `export * from './forms/form-modal-layout'`.
  - `src/app/(root)/scraping/items/components/ImportData.tsx`: Chuyển đổi `<FormModalLayout>` $\rightarrow$ `<CustomModal modalProps={{ ... }}>` (hoặc trực tiếp `<CustomModal open={open} ...>`).
  - `src/app/(root)/scraping/scraping-data/components/ProcessScrapeData.tsx`: Chuyển đổi `<FormModalLayout>` $\rightarrow$ `<CustomModal>`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── app/(root)/scraping/
│   ├── items/components/
│   │   └── [MODIFY] ImportData.tsx                         # Chuyển FormModalLayout sang CustomModal
│   └── scraping-data/components/
│       └── [MODIFY] ProcessScrapeData.tsx                  # Chuyển FormModalLayout sang CustomModal
├── components/common/
│   ├── [MODIFY] index.ts                                   # Bỏ export form-modal-layout
│   └── forms/
│       └── form-modal-layout/
│           ├── [DELETE] CreateFormDialog.tsx               # Xoá component legacy không dùng
│           ├── [DELETE] EditFormDialog.tsx                 # Xoá component legacy không dùng
│           ├── [DELETE] FormFields.tsx                     # Xoá renderer legacy không dùng
│           ├── [DELETE] FormModalLayout.tsx                # Xoá layout wrapper legacy
│           └── [DELETE] index.ts                           # Xoá barrel export legacy
└── interfaces/
    ├── [MODIFY] component.ts                               # Thêm IOption, xoá IFormFieldItem
    ├── [MODIFY] forms.ts                                   # Import IOption từ component.ts
    ├── [MODIFY] filter.ts                                  # Tiếp nhận IFilterField, FilterType, FilterValue
    ├── [MODIFY] containers.ts                              # Import IFilterField từ filter.ts, dọn dẹp trùng lặp
    └── [MODIFY] index.ts                                   # Đảm bảo barrel export toàn vẹn
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/items/components/ImportData.tsx` | `ImportData` JSX wrapper | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/scraping-data/components/ProcessScrapeData.tsx` | `ProcessScrapeData` JSX wrapper | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[DELETE]` | `src/components/common/forms/form-modal-layout/CreateFormDialog.tsx` | Delete file | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[DELETE]` | `src/components/common/forms/form-modal-layout/EditFormDialog.tsx` | Delete file | `Order 1, 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[DELETE]` | `src/components/common/forms/form-modal-layout/FormFields.tsx` | Delete file | `Order 1, 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[DELETE]` | `src/components/common/forms/form-modal-layout/FormModalLayout.tsx` | Delete file | `Order 1, 2` | `npx tsc --noEmit` |
| **7** | `[x]` | `[DELETE]` | `src/components/common/forms/form-modal-layout/index.ts` | Delete file | `Order 3-6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Remove `form-modal-layout` export | `Order 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/interfaces/component.ts` | Export `IOption`, purge `IFormFieldItem` | `None` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | Import `IOption` from `./component` | `Order 9` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/interfaces/filter.ts` | SSOT for `IFilterField`, `FilterType`, `FilterValue` | `Order 9` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/interfaces/containers.ts` | Import filter types from `./filter`, keep container types | `Order 10, 11` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | Verify full barrel re-exports | `Order 9-12` | `npm run build` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/app/(root)/scraping/items/components/ImportData.tsx`
> **Action**: Thay thế `FormModalLayout` bằng `CustomModal` chuẩn từ `@/components/custom-antd`.

```diff
@@ -1,5 +1,4 @@
 'use client';
 
-import { FormModalLayout } from '@/components/common';
 import {
     CustomCard,
@@ -7,4 +6,5 @@
     CustomButton,
     CustomFlex,
+    CustomModal,
     CustomSpace,
     CustomSpin,
@@ -370,12 +370,12 @@
     return (
-        <FormModalLayout
-            formLoading={false}
-            modalProps={{
-                open,
-                width: 900,
-                centered: true,
-                loading: isLoading,
-                title: 'Nhập dữ liệu',
-                footer: renderFooter(),
-            }}
-        >
+        <CustomModal
+            open={open}
+            width={900}
+            centered
+            loading={isLoading}
+            title="Nhập dữ liệu"
+            footer={renderFooter()}
+        >
             <CustomSpace direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
@@ -397,3 +397,3 @@
             </CustomSpace>
-        </FormModalLayout>
+        </CustomModal>
     );
```

---

### 2. `[MODIFY]` `src/app/(root)/scraping/scraping-data/components/ProcessScrapeData.tsx`
> **Action**: Thay thế `FormModalLayout` bằng `CustomModal` chuẩn từ `@/components/custom-antd`.

```diff
@@ -1,5 +1,4 @@
 'use client';
 
-import { FormModalLayout } from '@/components/common';
 import {
     CustomCard,
@@ -7,4 +6,5 @@
     CustomButton,
     CustomFlex,
+    CustomModal,
     CustomSpace,
     CustomSpin,
@@ -381,12 +380,12 @@
     return (
-        <FormModalLayout
-            formLoading={false}
-            modalProps={{
-                open,
-                width: 900,
-                centered: true,
-                loading: isLoading,
-                title: 'Cào dữ liệu',
-                footer: renderFooter(),
-            }}
-        >
+        <CustomModal
+            open={open}
+            width={900}
+            centered
+            loading={isLoading}
+            title="Cào dữ liệu"
+            footer={renderFooter()}
+        >
             <CustomSpace direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
@@ -408,3 +407,3 @@
             </CustomSpace>
-        </FormModalLayout>
+        </CustomModal>
     );
```

---

### 3. `[DELETE]` `src/components/common/forms/form-modal-layout/*`
> **Action**: Xóa bỏ toàn bộ 5 tệp trong thư mục `form-modal-layout` do không còn bất kỳ component nào sử dụng:
- `src/components/common/forms/form-modal-layout/CreateFormDialog.tsx`
- `src/components/common/forms/form-modal-layout/EditFormDialog.tsx`
- `src/components/common/forms/form-modal-layout/FormFields.tsx`
- `src/components/common/forms/form-modal-layout/FormModalLayout.tsx`
- `src/components/common/forms/form-modal-layout/index.ts`

---

### 4. `[MODIFY]` `src/components/common/index.ts`
> **Action**: Xoá dòng re-export thư mục `form-modal-layout`.

```diff
@@ -34,4 +34,3 @@
 export * from './forms/custom-select-input';
 export * from './forms/custom-switch-form';
 export * from './forms/custom-upload-form';
-export * from './forms/form-modal-layout';
 export * from './forms/html-editor';
```

---

### 5. `[MODIFY]` `src/interfaces/component.ts`
> **Action**: Thêm định nghĩa `IOption`, xoá bỏ `IFormFieldItem` và các sub-interfaces legacy.

```diff
@@ -1,75 +1,19 @@
-import type { FormInstance, Rule } from '@/components/custom-antd';
-import { ReactNode } from 'react';
-import type { IOption } from './forms';
+import type { ReactNode } from 'react';
+
+export interface IOption<TValue = string | number, TLabel = ReactNode> {
+    value: TValue;
+    label: TLabel;
+    key?: string;
+}
 
 export type CustomCardPadding = 'sm' | 'lg' | 'none' | 'default' | 'responsive';
 
 export type CustomCardShadow = 'none' | 'sm';
 
 export type CustomLinkVariant = 'default' | 'primary';
 
 export type CustomButtonHubVariant = 'cta';
 
 export type CustomTagStatus = 'active' | 'running' | 'draft' | 'error' | 'warning';
 
 export type CustomAlertType = 'info' | 'success' | 'warning' | 'error';
-
-export interface IFormFieldItemCodeProps {
-    title?: string;
-    loading?: boolean;
-    expanded?: boolean;
-    maxHeight?: string;
-    language?: 'json' | 'javascript' | 'html';
-    isDisplayLanguage?: boolean;
-}
-
-export interface IFormFieldItemInputProps {
-    placeholder?: string;
-    addonAfter?: ReactNode;
-    addonBefore?: ReactNode;
-}
-
-export interface IFormFieldItemSelectProps {
-    placeholder?: string;
-    options?: IOption[];
-    allowClear?: boolean;
-    showSearch?: boolean;
-}
-
-export interface IFormFieldItemSwitchProps {
-    placeholder?: string;
-}
-
-export interface IFormFieldItemTextareaProps {
-    placeholder?: string;
-    rows?: number;
-}
-
-export interface IFormFieldItemUploadProps {
-    accept?: string;
-    maxCount?: number;
-    multiple?: boolean;
-}
-
-export interface IFormFieldItem {
-    name: string;
-    label: string;
-    type: 'input' | 'select' | 'textarea' | 'switch' | 'code-display' | 'upload';
-
-    span?: number;
-    rules?: Rule[];
-    hidden?: boolean;
-    tooltip?: string;
-    disabled?: boolean;
-    elementTopRender?: ReactNode;
-    elementBottomRender?: ReactNode;
-    onChange?: (value: unknown, form?: FormInstance) => void;
-
-    codeProps?: IFormFieldItemCodeProps;
-    inputProps?: IFormFieldItemInputProps;
-    selectProps?: IFormFieldItemSelectProps;
-    switchProps?: IFormFieldItemSwitchProps;
-    textareaProps?: IFormFieldItemTextareaProps;
-    uploadProps?: IFormFieldItemUploadProps;
-}
```

---

### 6. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Import `IOption` từ `./component`.

```diff
@@ -11,4 +11,5 @@
 import type { FormMode } from '@/hooks';
 import type { FormRuleConfig } from '@/utilities';
 import type { ReactNode } from 'react';
+import type { IOption } from './component';
 
 export type FormFieldType =
     'input' | 'number' | 'password' | 'textarea' | 'select' | 'switch' | 'custom';
 
-export interface IOption<TValue = string | number, TLabel = ReactNode> {
-    value: TValue;
-    label: TLabel;
-    key?: string;
-}
+export type { IOption };
 
 export interface IFieldFormConfig {
```

---

### 7. `[MODIFY]` `src/interfaces/filter.ts`
> **Action**: Chuẩn hóa `filter.ts` thành SSOT cho toàn bộ Filter Contracts (`FilterType`, `FilterValue`, `IFilterOption`, `IFilterField`).

```diff
@@ -1,9 +1,42 @@
+import type {
+    CustomPicker,
+    InputProps,
+    SegmentedProps,
+    SelectProps,
+} from '@/components/custom-antd';
 import { CustomFilterType } from '@/enums';
 import { CrudOperators } from '@refinedev/core';
-import { ReactNode } from 'react';
-import type { IOption } from './forms';
+import type { Dayjs } from 'dayjs';
+import type { ComponentProps, ReactNode } from 'react';
+import type { IOption } from './component';
 
+// --- Standard Filter Contracts ---
+export type FilterValue =
+    | string
+    | number
+    | boolean
+    | string[]
+    | number[]
+    | [Dayjs, Dayjs]
+    | null
+    | undefined;
+
+export type FilterType = 'input' | 'select' | 'dateRange' | 'segmented';
+
+export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;
+
+export interface IFilterField {
+    name: string;
+    type: FilterType;
+    label?: ReactNode;
+    value?: FilterValue;
+    className?: string;
+    isPrimary?: boolean;
+    enableDateRangePresets?: boolean;
+    placeholder?: string | [string, string];
+    onChange?: (value: FilterValue) => void;
+
+    options?: IFilterOption[];
+    inputProps?: InputProps;
+    selectProps?: SelectProps;
+    segmentedProps?: SegmentedProps;
+    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
+}
+
+// --- Legacy Filter Contracts ---
 export interface IFilterItem {
     span: number;
     type: CustomFilterType;
```

---

### 8. `[MODIFY]` `src/interfaces/containers.ts`
> **Action**: Import filter types từ `./filter` và form types từ `./forms`, tập trung vào Table/Layout/Metadata.

```diff
@@ -1,15 +1,11 @@
-import type {
-    CustomPicker,
-    InputProps,
-    MenuProps,
-    SegmentedProps,
-    SelectProps,
-} from '@/components/custom-antd';
-import type { Dayjs } from 'dayjs';
-import type { ComponentProps, Key, MouseEvent, ReactNode } from 'react';
-import type { IFieldFormConfig, IOption } from './forms';
+import type { MenuProps } from '@/components/custom-antd';
+import type { Key, MouseEvent, ReactNode } from 'react';
+import type { FilterType, FilterValue, IFilterField, IFilterOption } from './filter';
+import type { IFieldFormConfig } from './forms';
 
-// --- Field & Metadata Config ---
+// Re-export filter contracts for backward compatibility
+export type { FilterType, FilterValue, IFilterField, IFilterOption };
+
+// --- Field & Metadata Config ---
 export interface IFieldTableConfig {
     title?: string;
     sorter?: boolean;
@@ -29,27 +25,6 @@
     onClick?: () => void;
 }
 
-// --- Filters Contract ---
-export type FilterValue =
-    string | number | boolean | string[] | number[] | [Dayjs, Dayjs] | null | undefined;
-
-export type FilterType = 'input' | 'select' | 'dateRange' | 'segmented';
-
-export type IFilterOption = IOption<string | number | null | undefined, ReactNode>;
-
-export interface IFilterField {
-    name: string;
-    type: FilterType;
-    label?: ReactNode;
-    value?: FilterValue;
-    className?: string;
-    isPrimary?: boolean;
-    enableDateRangePresets?: boolean;
-    placeholder?: string | [string, string];
-    onChange?: (value: FilterValue) => void;
-
-    options?: IFilterOption[];
-    inputProps?: InputProps;
-    selectProps?: SelectProps;
-    segmentedProps?: SegmentedProps;
-    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
-}
-
 // --- List Table Custom Action ---
 export interface ITableCustomAction<RecordType> {
     key: string;
```

---

### 9. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Duy trì barrel exports cho tất cả module interface.

```typescript
export * from './auth';
export * from './base-api';
export * from './component';
export * from './api-hooks';
export * from './notification';
export * from './media';
export * from './navigation';
export * from './filter';
export * from './containers';
export * from './forms';
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` $\rightarrow$ **PASS (0 errors, 0 warnings)**
  - `[x]` `npx eslint src` $\rightarrow$ **PASS (0 errors, 0 warnings)**
  - `[x]` `npm run build` $\rightarrow$ **PASS (Compiled successfully, 30/30 static & dynamic routes generated)**
- **Manual Checks**:
  - `[x]` Đã kiểm tra và xác nhận không còn bất kỳ broken reference nào đến `form-modal-layout` hay `IFormFieldItem`.
  - `[x]` Đã xác nhận `FormModalContainer` là container duy nhất cho các Refine CRUD Form Modals.

