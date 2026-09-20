---
status: done
slug: 20260920-145348-refactor-components-structure
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Tái Cấu Trúc Thư Mục src/components, Chuẩn Hóa Domain Containers/Forms & Colocate Types

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Hiện trạng & Bottleneck kiến trúc**: Thư mục `src/components/common/` hiện tại đang chứa cấu trúc phân cấp chưa tối ưu và có sự sai lệch phân loại domain (Architectural Misclassification):
  1. `custom-modal-form` và `custom-drawer-form` bản chất là **Containers** (hộp thoại bọc form và liên kết hook modal/drawer), nhưng lại bị đặt nhầm vào `forms/`.
  2. `custom-form-field` và `custom-form-list-field` là **Schema Rendering Engine** nội bộ của `custom-form-section`, nhưng lại bị tách riêng thành các folder ngang cấp trong `forms/`.
  3. Các sub-components gắn chặt với cha như `breadcrumb-nav`, `filter-panel`, `list-header` (thuộc `list-container`) hay `pagination-controls`, `mobile-card-list` (thuộc `list-table`) và `html-editor` (thuộc `custom-html-editor-form`) bị phân mảnh thành các top-level folder riêng.
  4. Hợp đồng types (`forms.ts`, `details.ts`, `containers.ts`, `filter.ts`, `media.ts`, `navigation.ts`) đang tập trung ở `src/interfaces/` thay vì được colocate trực tiếp tại component sở hữu.
  5. Thư mục trung gian `src/components/common/` tạo thêm một tầng nesting dư thừa không cần thiết.
- **Invariants bắt buộc duy trì**:
  - Không thay đổi bất kỳ business logic, render lifecycle, runtime state hay CSS design tokens (`hub-*`) của toàn bộ components.
  - Tuyệt đối không để xảy ra broken imports tại bất kỳ file consumer nào (`src/app/**`, `src/contexts/**`, `src/libs/**`).
  - Mọi import qua barrel export `@/components` và `@/components/custom-antd` phải hoạt động trơn tru.
  - Tuân thủ nghiêm ngặt ESLint rules (`no-restricted-imports`, generic `TRow extends object = Record<string, unknown>`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Colocated Code Contracts**:
  - `src/components/containers/list-container/types.ts`: Chứa `IBreadcrumbItem`, `IFilterField`, `ListContainerProps`, `ListHeaderProps`, `FilterPanelProps`, `BreadcrumbNavProps`.
  - `src/components/containers/list-table/types.ts`: Chứa `ListTableProps`, `ITableCustomAction`, `ICardAction`, `PaginationControlsProps`, `MobileCardListProps`.
  - `src/components/containers/form-modal-container/types.ts`: Chứa `FormModalContainerProps`, `CustomModalFormProps`.
  - `src/components/containers/form-drawer-container/types.ts`: Chứa `FormDrawerContainerProps`, `CustomDrawerFormProps`.
  - `src/components/containers/detail-modal-container/types.ts`: Chứa `DetailModalContainerProps`.
  - `src/components/forms/custom-form-section/types.ts`: Chứa `IFormField`, `IFormSection`, `FormFieldType`, `IInputFormField`, `IListFormField`, `ICustomFormFieldProps`, `CustomFormSectionProps`...
  - `src/components/display/custom-detail-section/types.ts`: Chứa `IDetailSection`, `IDescriptionsDetailSection`, `ITableDetailSection`, `ITabsDetailSection`, `ICardDetailSection`, `ICustomDetailSection`, `IDetailDescriptionItem`, `DetailFormatType`...
  - `src/components/display/media-lightbox/types.ts`: Chứa `IMediaItem`, `ILightboxProps`.
- **AST Seams & Callers**:
  - `src/components/index.ts`: Unified barrel export của toàn bộ `@/components` (`containers`, `forms`, `display`, `feedback`, `custom-antd`, `layout`).
  - `src/interfaces/index.ts`: Re-export các types colocated và chỉ giữ lại global core contracts (`auth.ts`, `base-api.ts`, `component.ts`, `api-hooks.ts`, `notification.ts`).
  - Mọi consumers tại `src/app/**`, `src/contexts/**`, `src/libs/**`, `src/components/layout/**` chuyển import từ `@/components/common` $\rightarrow$ `@/components`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/components/
├── containers/
│   ├── [NEW]    list-container/
│   │   ├── BreadcrumbNav.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ListHeader.tsx
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    list-table/
│   │   ├── PaginationControls.tsx
│   │   ├── MobileCardList.tsx
│   │   ├── utils.ts
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    form-modal-container/
│   │   ├── CustomModalForm.tsx
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    form-drawer-container/
│   │   ├── CustomDrawerForm.tsx
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    detail-modal-container/
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    types.ts
│   └── [NEW]    index.ts
│
├── forms/
│   ├── [NEW]    custom-form-section/
│   │   ├── CustomFormField.tsx
│   │   ├── CustomFormListField.tsx
│   │   ├── CardFormSection.tsx
│   │   ├── CollapseFormSection.tsx
│   │   ├── PlainFormSection.tsx
│   │   ├── TabsFormSection.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    custom-form-list/index.tsx
│   ├── [NEW]    custom-html-editor-form/
│   │   ├── HtmlEditor.tsx
│   │   └── index.tsx
│   ├── [NEW]    custom-checkbox-group-form/index.tsx
│   ├── [NEW]    custom-code-editor-form/index.tsx
│   ├── [NEW]    custom-date-picker-form/index.tsx
│   ├── [NEW]    custom-input-form/index.tsx
│   ├── [NEW]    custom-json-toggle-form/index.tsx
│   ├── [NEW]    custom-radio-group-form/index.tsx
│   ├── [NEW]    custom-range-picker/index.tsx
│   ├── [NEW]    custom-select-input/index.tsx
│   ├── [NEW]    custom-switch-form/index.tsx
│   ├── [NEW]    custom-upload-form/index.tsx
│   ├── [NEW]    types.ts
│   └── [NEW]    index.ts
│
├── display/
│   ├── [NEW]    custom-detail-section/
│   │   ├── DescriptionsDetailSection.tsx
│   │   ├── TableDetailSection.tsx
│   │   ├── TabsDetailSection.tsx
│   │   ├── CardDetailSection.tsx
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    media-lightbox/
│   │   ├── types.ts
│   │   └── index.tsx
│   ├── [NEW]    code-display/index.tsx
│   ├── [NEW]    file-group/FileGroups.tsx, index.tsx
│   ├── [NEW]    logo/index.tsx
│   ├── [NEW]    stat-card/index.tsx
│   ├── [NEW]    status-tag/index.tsx
│   ├── [NEW]    types.ts
│   └── [NEW]    index.ts
│
├── feedback/
│   ├── [NEW]    data-not-found/index.tsx
│   ├── [NEW]    empty/index.tsx
│   ├── [NEW]    forbidden/index.tsx
│   ├── [NEW]    loading/index.tsx
│   ├── [NEW]    not-found/index.tsx
│   ├── [NEW]    unsaved-changes-notifier-app-router/index.tsx
│   └── [NEW]    index.ts
│
├── [NEW]    index.ts                                  # Unified Barrel Export cho @/components
├── [DELETE] common/                                   # Xóa toàn bộ thư mục common cũ sau khi migrate
│
└── interfaces/
    ├── [MODIFY] index.ts                              # Re-export types colocated
    ├── [DELETE] forms.ts                              # Đã colocate vào forms/custom-form-section/types.ts
    ├── [DELETE] details.ts                            # Đã colocate vào display/custom-detail-section/types.ts
    ├── [DELETE] containers.ts                         # Đã colocate vào containers/*/types.ts
    ├── [DELETE] filter.ts                             # Đã colocate vào containers/list-container/types.ts
    ├── [DELETE] media.ts                              # Đã colocate vào display/media-lightbox/types.ts
    └── [DELETE] navigation.ts                         # Đã colocate vào containers/list-container/types.ts
```

---

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/components/containers/list-container/types.ts` | `IBreadcrumbItem`, `IFilterField`, `ListContainerProps` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/components/containers/list-container/BreadcrumbNav.tsx` | `BreadcrumbNav` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/components/containers/list-container/FilterPanel.tsx` | `FilterPanel` | `Order 1` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/components/containers/list-container/ListHeader.tsx` | `ListHeader` | `Order 1, 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/components/containers/list-container/index.tsx` | `ListContainer`, export sub-components | `Order 2, 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/components/containers/list-table/types.ts` | `ListTableProps`, `ITableCustomAction`, `ICardAction` | `None` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/components/containers/list-table/utils.ts` | Table utils | `Order 6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[NEW]` | `src/components/containers/list-table/PaginationControls.tsx` | `PaginationControls` | `Order 6` | `npx tsc --noEmit` |
| **9** | `[x]` | `[NEW]` | `src/components/containers/list-table/MobileCardList.tsx` | `MobileCardList` | `Order 6` | `npx tsc --noEmit` |
| **10** | `[x]` | `[NEW]` | `src/components/containers/list-table/index.tsx` | `ListTable`, export sub-components | `Order 7, 8, 9` | `npx tsc --noEmit` |
| **11** | `[x]` | `[NEW]` | `src/components/containers/form-modal-container/types.ts` | `FormModalContainerProps`, `CustomModalFormProps` | `None` | `npx tsc --noEmit` |
| **12** | `[x]` | `[NEW]` | `src/components/containers/form-modal-container/CustomModalForm.tsx` | `CustomModalForm` | `Order 11` | `npx tsc --noEmit` |
| **13** | `[x]` | `[NEW]` | `src/components/containers/form-modal-container/index.tsx` | `FormModalContainer`, `CustomModalForm` | `Order 12` | `npx tsc --noEmit` |
| **14** | `[x]` | `[NEW]` | `src/components/containers/form-drawer-container/types.ts` | `FormDrawerContainerProps`, `CustomDrawerFormProps` | `None` | `npx tsc --noEmit` |
| **15** | `[x]` | `[NEW]` | `src/components/containers/form-drawer-container/CustomDrawerForm.tsx` | `CustomDrawerForm` | `Order 14` | `npx tsc --noEmit` |
| **16** | `[x]` | `[NEW]` | `src/components/containers/form-drawer-container/index.tsx` | `FormDrawerContainer`, `CustomDrawerForm` | `Order 15` | `npx tsc --noEmit` |
| **17** | `[x]` | `[NEW]` | `src/components/containers/detail-modal-container/types.ts` | `DetailModalContainerProps` | `None` | `npx tsc --noEmit` |
| **18** | `[x]` | `[NEW]` | `src/components/containers/detail-modal-container/index.tsx` | `DetailModalContainer` | `Order 17` | `npx tsc --noEmit` |
| **19** | `[x]` | `[NEW]` | `src/components/containers/types.ts` | Re-export container types | `Order 1, 6, 11, 14, 17` | `npx tsc --noEmit` |
| **20** | `[x]` | `[NEW]` | `src/components/containers/index.ts` | Barrel export containers | `Order 5, 10, 13, 16, 18, 19` | `npx tsc --noEmit` |
| **21** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/types.ts` | `IFormField`, `IFormSection`, `FormFieldType`... | `None` | `npx tsc --noEmit` |
| **22** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/CustomFormField.tsx` | `CustomFormField` schema dispatcher | `Order 21` | `npx tsc --noEmit` |
| **23** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/CustomFormListField.tsx` | `CustomFormListField` dynamic list renderer | `Order 21, 22` | `npx tsc --noEmit` |
| **24** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/SectionHeader.tsx` | `SectionHeader` | `Order 21` | `npx tsc --noEmit` |
| **25** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/CardFormSection.tsx` | `CardFormSection` | `Order 22, 24` | `npx tsc --noEmit` |
| **26** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/CollapseFormSection.tsx` | `CollapseFormSection` | `Order 22, 24` | `npx tsc --noEmit` |
| **27** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/PlainFormSection.tsx` | `PlainFormSection` | `Order 22, 24` | `npx tsc --noEmit` |
| **28** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/TabsFormSection.tsx` | `TabsFormSection` | `Order 22, 24` | `npx tsc --noEmit` |
| **29** | `[x]` | `[NEW]` | `src/components/forms/custom-form-section/index.tsx` | `CustomFormSection`, export engine components | `Order 22-28` | `npx tsc --noEmit` |
| **30** | `[x]` | `[NEW]` | `src/components/forms/custom-form-list/index.tsx` | `CustomFormList` | `None` | `npx tsc --noEmit` |
| **31** | `[x]` | `[NEW]` | `src/components/forms/custom-html-editor-form/HtmlEditor.tsx` | `HtmlEditor` | `None` | `npx tsc --noEmit` |
| **32** | `[x]` | `[NEW]` | `src/components/forms/custom-html-editor-form/index.tsx` | `CustomHtmlEditorForm`, `HtmlEditor` | `Order 31` | `npx tsc --noEmit` |
| **33** | `[x]` | `[NEW]` | `src/components/forms/custom-input-form/index.tsx` | `CustomInputForm` | `None` | `npx tsc --noEmit` |
| **34** | `[x]` | `[NEW]` | `src/components/forms/custom-select-input/index.tsx` | `CustomSelectInput` | `None` | `npx tsc --noEmit` |
| **35** | `[x]` | `[NEW]` | `src/components/forms/custom-switch-form/index.tsx` | `CustomSwitchForm` | `None` | `npx tsc --noEmit` |
| **36** | `[x]` | `[NEW]` | `src/components/forms/custom-date-picker-form/index.tsx` | `CustomDatePickerForm` | `None` | `npx tsc --noEmit` |
| **37** | `[x]` | `[NEW]` | `src/components/forms/custom-range-picker/index.tsx` | `CustomRangePicker` | `None` | `npx tsc --noEmit` |
| **38** | `[x]` | `[NEW]` | `src/components/forms/custom-checkbox-group-form/index.tsx` | `CustomCheckboxGroupForm` | `None` | `npx tsc --noEmit` |
| **39** | `[x]` | `[NEW]` | `src/components/forms/custom-radio-group-form/index.tsx` | `CustomRadioGroupForm` | `None` | `npx tsc --noEmit` |
| **40** | `[x]` | `[NEW]` | `src/components/forms/custom-code-editor-form/index.tsx` | `CustomCodeEditorForm` | `None` | `npx tsc --noEmit` |
| **41** | `[x]` | `[NEW]` | `src/components/forms/custom-json-toggle-form/index.tsx` | `CustomJsonToggleForm` | `None` | `npx tsc --noEmit` |
| **42** | `[x]` | `[NEW]` | `src/components/forms/custom-upload-form/index.tsx` | `CustomUploadForm` | `None` | `npx tsc --noEmit` |
| **43** | `[x]` | `[NEW]` | `src/components/forms/types.ts` | Re-export forms types | `Order 21` | `npx tsc --noEmit` |
| **44** | `[x]` | `[NEW]` | `src/components/forms/index.ts` | Barrel export forms | `Order 29-43` | `npx tsc --noEmit` |
| **45** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/types.ts` | `IDetailSection`, `IDetailDescriptionItem`... | `None` | `npx tsc --noEmit` |
| **46** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/DescriptionsDetailSection.tsx` | `DescriptionsDetailSection` | `Order 45` | `npx tsc --noEmit` |
| **47** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/TableDetailSection.tsx` | `TableDetailSection` | `Order 45` | `npx tsc --noEmit` |
| **48** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/TabsDetailSection.tsx` | `TabsDetailSection` | `Order 45` | `npx tsc --noEmit` |
| **49** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/CardDetailSection.tsx` | `CardDetailSection` | `Order 45` | `npx tsc --noEmit` |
| **50** | `[x]` | `[NEW]` | `src/components/display/custom-detail-section/index.tsx` | `CustomDetailSection` | `Order 46-49` | `npx tsc --noEmit` |
| **51** | `[x]` | `[NEW]` | `src/components/display/media-lightbox/types.ts` | `IMediaItem`, `ILightboxProps` | `None` | `npx tsc --noEmit` |
| **52** | `[x]` | `[NEW]` | `src/components/display/media-lightbox/index.tsx` | `MediaLightbox` | `Order 51` | `npx tsc --noEmit` |
| **53** | `[x]` | `[NEW]` | `src/components/display/code-display/index.tsx` | `CodeDisplay` | `None` | `npx tsc --noEmit` |
| **54** | `[x]` | `[NEW]` | `src/components/display/file-group/FileGroups.tsx, index.tsx` | `FileGroup` | `None` | `npx tsc --noEmit` |
| **55** | `[x]` | `[NEW]` | `src/components/display/logo/index.tsx` | `Logo` | `None` | `npx tsc --noEmit` |
| **56** | `[x]` | `[NEW]` | `src/components/display/stat-card/index.tsx` | `StatCard` | `None` | `npx tsc --noEmit` |
| **57** | `[x]` | `[NEW]` | `src/components/display/status-tag/index.tsx` | `StatusTag` | `None` | `npx tsc --noEmit` |
| **58** | `[x]` | `[NEW]` | `src/components/display/types.ts` | Re-export display types | `Order 45, 51` | `npx tsc --noEmit` |
| **59** | `[x]` | `[NEW]` | `src/components/display/index.ts` | Barrel export display | `Order 50, 52-58` | `npx tsc --noEmit` |
| **60** | `[x]` | `[NEW]` | `src/components/feedback/data-not-found/index.tsx` | `DataNotFound` | `None` | `npx tsc --noEmit` |
| **61** | `[x]` | `[NEW]` | `src/components/feedback/empty/index.tsx` | `Empty` | `None` | `npx tsc --noEmit` |
| **62** | `[x]` | `[NEW]` | `src/components/feedback/forbidden/index.tsx` | `Forbidden` | `None` | `npx tsc --noEmit` |
| **63** | `[x]` | `[NEW]` | `src/components/feedback/loading/index.tsx` | `Loading` | `None` | `npx tsc --noEmit` |
| **64** | `[x]` | `[NEW]` | `src/components/feedback/not-found/index.tsx` | `NotFound` | `None` | `npx tsc --noEmit` |
| **65** | `[x]` | `[NEW]` | `src/components/feedback/unsaved-changes-notifier-app-router/index.tsx` | `UnsavedChangesNotifierAppRouter` | `None` | `npx tsc --noEmit` |
| **66** | `[x]` | `[NEW]` | `src/components/feedback/index.ts` | Barrel export feedback | `Order 60-65` | `npx tsc --noEmit` |
| **67** | `[x]` | `[NEW]` | `src/components/index.ts` | Main unified barrel export `@/components` | `Order 20, 44, 59, 66` | `npx tsc --noEmit` |
| **68** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | Re-export colocated types & clean up | `Order 67` | `npx tsc --noEmit` |
| **69** | `[x]` | `[MODIFY]` | Consumers across `src/` | Chuyển `@/components/common` $\rightarrow$ `@/components` | `Order 67, 68` | `npx tsc --noEmit` |
| **70** | `[x]` | `[DELETE]` | `src/components/common/` | Xóa thư mục cũ sau khi hoàn tất migrate | `Order 69` | `npx tsc --noEmit` |
| **71** | `[x]` | `[DELETE]` | `src/interfaces/forms.ts`, `details.ts`, `containers.ts`, `filter.ts`, `media.ts`, `navigation.ts` | Xóa các type files cũ | `Order 69` | `npx tsc --noEmit` |
| **72** | `[x]` | `[VERIFY]` | Full Codebase Verification | Chạy TypeScript compiler và ESLint | `Order 70, 71` | `npx tsc --noEmit && npm run lint:fix` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/components/containers/form-modal-container/CustomModalForm.tsx`
> **Action**: Chuyển `custom-modal-form` từ `forms/` sang `containers/form-modal-container/` đúng mục đích container.

```tsx
'use client';

import { CustomButton, CustomFlex, CustomModal } from '@/components/custom-antd';
import type { UseModalFormReturnType } from '@refinedev/antd';
import type { ModalProps } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ReactNode } from 'react';
import type { CustomModalFormProps } from './types';

export const CustomModalForm = <
    TData extends object = Record<string, unknown>,
    TVariables extends object = Record<string, unknown>,
>({
    modalProps,
    formProps,
    saveButtonProps,
    title,
    children,
    okText = 'Lưu',
    cancelText = 'Hủy',
    extraActions,
    width = 600,
    maskClosable = false,
    destroyOnClose = true,
    className = '',
    customFooter,
    autoResetForm = true,
    ...restModalProps
}: CustomModalFormProps<TData, TVariables>) => {
    // ... [GIỮ NGUYÊN 100% LOGIC IMPLEMENTATION TỪ FILE GỐC]
};
```

---

### 2. `[NEW]` `src/components/containers/form-drawer-container/CustomDrawerForm.tsx`
> **Action**: Chuyển `custom-drawer-form` từ `forms/` sang `containers/form-drawer-container/` đúng mục đích container.

```tsx
'use client';

import { CustomButton, CustomDrawer, CustomFlex, CustomSpace } from '@/components/custom-antd';
import type { CustomDrawerFormProps } from './types';

export const CustomDrawerForm = <
    TData extends object = Record<string, unknown>,
    TVariables extends object = Record<string, unknown>,
>({
    drawerProps,
    formProps,
    saveButtonProps,
    title,
    children,
    okText = 'Lưu',
    cancelText = 'Hủy',
    extraActions,
    width = 500,
    maskClosable = false,
    destroyOnClose = true,
    className = '',
    customFooter,
    ...restDrawerProps
}: CustomDrawerFormProps<TData, TVariables>) => {
    // ... [GIỮ NGUYÊN 100% LOGIC IMPLEMENTATION TỪ FILE GỐC]
};
```

---

### 3. `[NEW]` `src/components/forms/custom-form-section/CustomFormField.tsx`
> **Action**: Chuyển `custom-form-field` từ standalone folder về trực tiếp bên trong `forms/custom-form-section/` làm dispatcher rendering engine.

```tsx
'use client';

import {
    CustomCheckboxGroupForm,
    CustomCodeEditorForm,
    CustomDatePickerForm,
    CustomInputForm,
    CustomJsonToggleForm,
    CustomRadioGroupForm,
    CustomRangePicker,
    CustomSelectInput,
    CustomSwitchForm,
    CustomUploadForm,
} from '@/components';
import { CustomCol, CustomForm } from '@/components/custom-antd';
import { CustomFormListField } from './CustomFormListField';
import type { ICustomFormFieldProps } from './types';

export const CustomFormField = ({ field, form }: ICustomFormFieldProps) => {
    // ... [GIỮ NGUYÊN 100% DISPATCHER LOGIC TỪ FILE GỐC]
};
```

---

### 4. `[NEW]` `src/components/forms/custom-form-section/CustomFormListField.tsx`
> **Action**: Chuyển `custom-form-list-field` về trực tiếp bên trong `forms/custom-form-section/`.

```tsx
'use client';

import { CustomButton, CustomCard, CustomFlex, CustomForm, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { CustomFormField } from './CustomFormField';
import type { ICustomFormListFieldProps } from './types';

export const CustomFormListField = ({ field, form }: ICustomFormListFieldProps) => {
    // ... [GIỮ NGUYÊN 100% DYNAMIC LIST RENDERING LOGIC TỪ FILE GỐC]
};
```

---

### 5. `[NEW]` `src/components/index.ts`
> **Action**: Tạo Main Unified Barrel Export cho toàn bộ `@/components`.

```typescript
// Containers
export * from './containers';

// Forms (Atomic inputs & Form Schema Engine)
export * from './forms';

// Display & Presentations
export * from './display';

// Feedback & Error Screens
export * from './feedback';

// Custom Antd Primitives
export * from './custom-antd';

// Layout Components
export * from './layout';
```

---

### 6. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Re-export các types colocated và giữ lại core contracts.

```diff
@@ -1,12 +1,11 @@
 export * from './auth';
 export * from './base-api';
 export * from './component';
 export * from './api-hooks';
 export * from './notification';
-export * from './containers';
-export * from './filter';
-export * from './navigation';
-export * from './forms';
-export * from './media';
-export * from './details';
+
+// Re-export colocated types for backward-compatibility
+export * from '@/components/containers/types';
+export * from '@/components/forms/types';
+export * from '@/components/display/types';
```

---

## Section 5. Test Cases & Verification
- **Automated Type Checking**:
  ```bash
  npx tsc --noEmit
  ```
  - Evidence: `PASS` - Exited with code 0 (Zero TypeScript compilation errors).
- **ESLint Code Quality Check**:
  ```bash
  npm run lint:fix
  ```
  - Evidence: `PASS` - Exited with code 0 (100% adherence to restricted import rules, absolute paths `@/*`, and formatting).

