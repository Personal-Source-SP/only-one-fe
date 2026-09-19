---
status: done
slug: optimize-and-consolidate-interfaces
started_at: 2026-09-19
completed_at: 2026-09-19
pr_url: ~
branch: ~
---

# Plan: Rà Soát và Loại Bỏ Code Thừa / Dead Types trong `src/interfaces/`

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng `src/interfaces/`**: Toàn bộ hệ thống kiểu trong `src/interfaces/` đã được phân tách trách nhiệm theo từng module (`auth`, `base-api`, `api-hooks`, `component`, `containers`, `filter`, `forms`, `media`, `navigation`, `notification`).
- **Code thừa cần dọn dẹp**:
  - `src/interfaces/forms.ts`: Tồn tại import không sử dụng `CustomCheckboxProps`, import thừa `import type { IOption } from './component'` và re-export dư thừa `export type { IOption }`.
  - Các interface trong `src/interfaces/containers.ts` (`IBreadcrumbItem`, `ITableCustomAction`, `IActionMenuItem`, `ICardActionPermission`, `ICardAction`) và `src/interfaces/filter.ts` đều đang được sử dụng và giữ nguyên độc lập theo yêu cầu.
- **Invariants**:
  - Giữ nguyên toàn bộ các interface đang được sử dụng.
  - Không gộp các tệp interface, duy trì cấu trúc module độc lập.

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - `src/interfaces/forms.ts`: Loại bỏ unused import `CustomCheckboxProps`, unused import `IOption` và redundant re-export `export type { IOption };`.
- **AST Seams & Callers**:
  - `IOption` đã được export chính thức từ `src/interfaces/component.ts` thông qua `src/interfaces/index.ts`, mọi caller import `IOption` từ `@/interfaces` không bị ảnh hưởng.

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/interfaces/
└── [MODIFY] forms.ts    # Xóa CustomCheckboxProps import, IOption import & re-export
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | Remove `CustomCheckboxProps`, `import type { IOption }`, `export type { IOption }` | `None` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Loại bỏ unused import `CustomCheckboxProps` và redundant `IOption` import/export.

```diff
 import type {
     CustomCheckbox,
-    CustomCheckboxProps,
     CustomPicker,
     CustomPickerProps,
     CustomRadioGroupProps,
     CustomTabsProps,
     FormInstance,
     FormItemProps,
     InputNumberProps,
     InputProps,
     PasswordProps,
     SelectProps,
     SwitchProps,
     TextAreaProps,
     UploadProps,
 } from '@/components/custom-antd';
 import type { FormMode } from '@/hooks';
 import type { FormRuleConfig } from '@/utilities';
 import type { ComponentProps, ReactNode } from 'react';
-import type { IOption } from './component';

 export interface IHtmlEditorFieldProps {
     value?: string;
     onChange?: (value: string) => void;
     placeholder?: string;
     rows?: number;
     disabled?: boolean;
     className?: string;
 }

 export type FormFieldType =
     | 'input'
     | 'number'
     | 'password'
     | 'textarea'
     | 'select'
     | 'switch'
     | 'date_picker'
     | 'range_picker'
     | 'upload'
     | 'html_editor'
     | 'code_editor'
     | 'json_toggle'
     | 'radio_group'
     | 'checkbox_group'
     | 'custom';

-export type { IOption };
-
 export interface IBaseFormField<TValues = unknown> {
```

## Section 5. Test Cases & Verification
- **Automated Tests / Type Checking**:
  - [x] `npx tsc --noEmit` -> **PASS (0 errors)**. Toàn bộ mã nguồn TypeScript compile thành công.
  - [x] `npm run lint:fix` -> **PASS (0 errors, 0 warnings)**. Mã nguồn tuân thủ 100% ESLint & Prettier.
- **Manual Verification**:
  - [x] Đã xóa bỏ `CustomCheckboxProps`, `import type { IOption }` và `export type { IOption }` khỏi `src/interfaces/forms.ts`.
  - [x] Đảm bảo tính toàn vẹn và độc lập của tất cả các file interface còn lại trong `src/interfaces/`.
