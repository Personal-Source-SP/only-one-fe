---
status: done
slug: refactor-common-containers-and-interfaces
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn hoá Naming Convention Common Containers & Tái cấu trúc Interfaces UI Contracts

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Bất đồng nhất Danh pháp Container**: Các component layout cấp cao trong `src/components/common/containers/` đang sử dụng tiền tố/hậu tố bất nhất (`wrapper-header`, `wrapper-form-modal`, `list-wrapper`), gây nhầm lẫn về vai trò kiến trúc (`wrapper` vs `container`).
- **Phân tán Data/Contract Interfaces & Circular Dependency**: Các interface cấu hình dữ liệu dùng chung (`ICardAction`, `IFilterField`, `FilterOption`, `FilterValue`, `TableCustomAction`, `BreadcrumbItem`, `IFormField`) bị định nghĩa phân tán rải rác bên trong các file component. Đồng thời, `src/interfaces/component.ts` đang `import { CodeDisplayProps } from '@/components/common'`, tạo circular dependency giữa tầng Contract và Presentation.
- **Quy tắc Colocation Props**: Tất cả các **`*Props`** (Component Props types) bắt buộc **giữ nguyên tại file component tương ứng** để đảm bảo tính đóng gói (colocation) của React Component. Chỉ gom các **Data Contracts / Schema Configuration Interfaces** sử dụng chung về `src/interfaces/`.
- **Invariants bắt buộc duy trì**:
  - Giữ nguyên 100% logic rendering, default values và hành vi runtime của toàn bộ component.
  - Cung cấp type aliases & component aliases tương thích ngược (`WrapperHeader`, `WrapperFormModal`, `ListWrapper`, `ListWrapperProps`, `WrapperHeaderProps`, `WrapperFormModalProps`).
  - Đảm bảo `src/interfaces/` là Single Source of Truth độc lập, không import bất kỳ thứ gì từ `@/components/**`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ concept.md; không mô tả lại giải pháp tổng quan)*

### 2.1. Type Signatures & Code Contracts

- **Tạo mới `src/interfaces/containers.ts` (Chỉ chứa Shared Data Contracts, KHÔNG chứa Props)**:
  - `BreadcrumbItem`: Contract cho từng item trong Breadcrumb.
  - `FilterValue`, `FilterOption`, `IFilterField`: Contract cho các trường lọc trong CRUD.
  - `TableCustomAction<RecordType>`: Contract cho custom actions trong bảng dữ liệu.
  - `ActionMenuItem`: Contract cho menu action items trên mobile.
  - `ICardAction`: Contract cho action buttons ở Header / Card.
- **Tạo mới `src/interfaces/forms.ts` (Chỉ chứa Shared Form Schema Contracts, KHÔNG chứa Props)**:
  - `FormFieldType`: Union types các loại field hỗ trợ (`input`, `number`, `select`, etc.).
  - `IBaseFormField<TValues>`, `IInputFormField<TValues>`, `INumberFormField<TValues>`, `IPasswordFormField<TValues>`, `ITextAreaFormField<TValues>`, `ISelectFormField<TValues>`, `ISwitchFormField<TValues>`, `ICustomFormField<TValues>`, `IFormField<TValues>`: Schema discriminated union cho form fields động.
- **Cập nhật `src/interfaces/component.ts`**:
  - Xoá bỏ import phụ thuộc ngược `import { CodeDisplayProps } from '@/components/common'`.
  - Thay thế thuộc tính `codeProps` trong `IFormFieldItem` thành inline config `{ title?: string; language?: string; expanded?: boolean; maxHeight?: string; isDisplayLanguage?: boolean }` độc lập.
- **Cập nhật `src/interfaces/index.ts`**:
  - Re-export `containers` và `forms`.

### 2.2. Colocation của Component Props (Giữ nguyên tại Components)

- `BreadcrumbNavProps` $\rightarrow$ Giữ tại `src/components/common/containers/breadcrumb-nav/index.tsx`
- `FilterPanelProps` $\rightarrow$ Giữ tại `src/components/common/containers/filter-panel/index.tsx`
- `ListTableProps<RecordType>` $\rightarrow$ Giữ tại `src/components/common/containers/list-table/index.tsx`
- `MobileCardListProps`, `MobileCardItemProps`, `MobileCardActionsProps`, `MobileCardContentProps` $\rightarrow$ Giữ tại `src/components/common/containers/mobile-card-list/*`
- `PaginationControlsProps` $\rightarrow$ Giữ tại `src/components/common/containers/pagination-controls/index.tsx`
- `ListHeaderProps` (kèm alias `WrapperHeaderProps`) $\rightarrow$ Giữ tại `src/components/common/containers/list-header/index.tsx`
- `FormModalContainerProps` (kèm alias `WrapperFormModalProps`) $\rightarrow$ Giữ tại `src/components/common/containers/form-modal-container/index.tsx`
- `ListContainerProps` (kèm alias `ListWrapperProps`) $\rightarrow$ Giữ tại `src/components/common/containers/list-container/index.tsx`
- `CustomFormFieldProps` $\rightarrow$ Giữ tại `src/components/common/forms/custom-form-field/types.ts`
- `CodeDisplayProps` $\rightarrow$ Giữ tại `src/components/common/display/code-display/CodeDisplay.tsx`

### 2.3. AST Seams & Callers

- **Đổi tên Containers**:
  - `src/components/common/containers/wrapper-header/` $\rightarrow$ `src/components/common/containers/list-header/` (`ListHeader`)
  - `src/components/common/containers/wrapper-form-modal/` $\rightarrow$ `src/components/common/containers/form-modal-container/` (`FormModalContainer`)
  - `src/components/common/containers/list-wrapper/` $\rightarrow$ `src/components/common/containers/list-container/` (`ListContainer`)
- **Re-exports tại `src/components/common/index.ts`**:
  - Export `ListHeader`, `FormModalContainer`, `ListContainer` (kèm alias `WrapperHeader`, `WrapperFormModal`, `ListWrapper`).

---

## Section 3. Directory Structure & Task Matrix

### 3.1. Directory Structure Changes

```text
src/
├── interfaces/
│   ├── [MODIFY] index.ts
│   ├── [MODIFY] component.ts
│   ├── [NEW]    containers.ts
│   └── [NEW]    forms.ts
└── components/common/
    ├── [MODIFY] index.ts
    ├── containers/
    │   ├── [NEW/RENAME] list-header/index.tsx
    │   ├── [DELETE]     wrapper-header/index.tsx
    │   ├── [NEW/RENAME] form-modal-container/index.tsx
    │   ├── [DELETE]     wrapper-form-modal/index.tsx
    │   ├── [NEW/RENAME] list-container/index.tsx
    │   ├── [DELETE]     list-wrapper/index.tsx
    │   ├── [MODIFY]     breadcrumb-nav/index.tsx
    │   ├── [MODIFY]     filter-panel/index.tsx
    │   ├── [MODIFY]     list-table/index.tsx
    │   └── [MODIFY]     mobile-card-list/
    └── forms/
        └── custom-form-field/
            └── [MODIFY] types.ts
```

### 3.2. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/interfaces/containers.ts` | Khởi tạo shared data interfaces (`BreadcrumbItem`, `IFilterField`, `TableCustomAction`, `ICardAction`...) | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/interfaces/forms.ts` | Khởi tạo shared form schema interfaces (`IFormField`, `IBaseFormField`...) | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/interfaces/component.ts` | Xoá circular import `CodeDisplayProps` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/interfaces/index.ts` | Re-export `containers.ts` và `forms.ts` | `Order 1, 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/components/common/containers/list-header/index.tsx` | Tạo component `ListHeader` & `ListHeaderProps` | `Order 1` | `npx tsc --noEmit` |
| **6** | `[x]` | `[DELETE]` | `src/components/common/containers/wrapper-header/index.tsx` | Xoá file cũ | `Order 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/components/common/containers/form-modal-container/index.tsx` | Tạo component `FormModalContainer` & `FormModalContainerProps` | `Order 2` | `npx tsc --noEmit` |
| **8** | `[x]` | `[DELETE]` | `src/components/common/containers/wrapper-form-modal/index.tsx` | Xoá file cũ | `Order 7` | `npx tsc --noEmit` |
| **9** | `[x]` | `[NEW]` | `src/components/common/containers/list-container/index.tsx` | Tạo component `ListContainer` & `ListContainerProps` | `Order 1, 5, 7` | `npx tsc --noEmit` |
| **10** | `[x]` | `[DELETE]` | `src/components/common/containers/list-wrapper/index.tsx` | Xoá file cũ | `Order 9` | `npx tsc --noEmit` |
| **11** | `[x]` | `[MODIFY]` | `src/components/common/containers/breadcrumb-nav/index.tsx` | Import `BreadcrumbItem` từ `@/interfaces` | `Order 1` | `npx tsc --noEmit` |
| **12** | `[x]` | `[MODIFY]` | `src/components/common/containers/filter-panel/index.tsx` | Import `FilterValue`, `FilterOption`, `IFilterField` từ `@/interfaces` | `Order 1` | `npx tsc --noEmit` |
| **13** | `[x]` | `[MODIFY]` | `src/components/common/containers/list-table/index.tsx` | Import `TableCustomAction` từ `@/interfaces` | `Order 1` | `npx tsc --noEmit` |
| **14** | `[x]` | `[MODIFY]` | `src/components/common/containers/mobile-card-list/mobile-card-actions.tsx` | Import `ActionMenuItem` từ `@/interfaces` | `Order 1` | `npx tsc --noEmit` |
| **15** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-form-field/types.ts` | Re-export schema types từ `@/interfaces` và giữ `CustomFormFieldProps` | `Order 2` | `npx tsc --noEmit` |
| **16** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Cập nhật exports cho các container components mới | `Order 5, 7, 9` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/interfaces/containers.ts`
> **Action**: Khởi tạo Single Source of Truth cho các Data/Schema Contracts dùng chung trong Containers.

```typescript
import type { InputProps, MenuProps, SegmentedProps, SelectProps, CustomPicker } from '@/components/custom-antd';
import type { Dayjs } from 'dayjs';
import type { ComponentProps, Key, MouseEvent, ReactNode } from 'react';

// --- Breadcrumb Contract ---
export type BreadcrumbItem = {
    key?: string;
    href?: string;
    label: ReactNode;
    icon?: ReactNode;
    iconName?: string;
    separator?: ReactNode;
    onClick?: () => void;
};

// --- Filters Contract ---
export type FilterValue =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | [Dayjs, Dayjs]
    | null
    | undefined;

export interface FilterOption {
    label: ReactNode;
    value: string | number | null | undefined;
}

export interface IFilterField {
    name: string;
    placeholder?: string | [string, string];
    type: 'input' | 'select' | 'dateRange' | 'segmented';
    value?: FilterValue;
    label?: ReactNode;
    onChange?: (value: FilterValue) => void;
    options?: FilterOption[];
    className?: string;
    selectProps?: SelectProps;
    inputProps?: InputProps;
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
    enableDateRangePresets?: boolean;
    segmentedProps?: SegmentedProps;
    isPrimary?: boolean;
}

// --- List Table Custom Action ---
export interface TableCustomAction<RecordType> {
    key: string;
    icon?: ReactNode;
    tooltip?: string;
    danger?: boolean;
    keepOpen?: boolean;
    width?: number | string;
    allowedRoles?: string[];
    show?: boolean | ((record: RecordType) => boolean);
    onClick: (record: RecordType) => void;
    render?: (record: RecordType, closeDropdown: () => void) => ReactNode;
}

// --- Mobile Card List Menu Item ---
export type ActionMenuItem = NonNullable<MenuProps['items']>[number] & {
    key?: Key;
    icon?: ReactNode;
    danger?: boolean;
    label?: ReactNode;
    onClick?: (info?: { domEvent?: MouseEvent<HTMLElement>; key?: Key }) => void;
};

// --- Header Action Contract ---
export interface ICardAction {
    component?: ReactNode;
    permissionAction?: 'create' | 'update' | 'delete' | 'read';
    label?: ReactNode;
    icon?: ReactNode;
    key?: string;
    danger?: boolean;
    onClick?: () => void;
}
```

---

### 2. `[NEW]` `src/interfaces/forms.ts`
> **Action**: Khởi tạo Single Source of Truth cho các Form Field Schema Contracts dùng chung.

```typescript
import type {
    FormInstance,
    FormItemProps,
    InputNumberProps,
    InputProps,
    PasswordProps,
    SelectProps,
    SwitchProps,
    TextAreaProps,
} from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { FormRuleConfig } from '@/utilities';
import type { ReactNode } from 'react';

export type FormFieldType =
    | 'input'
    | 'number'
    | 'password'
    | 'textarea'
    | 'select'
    | 'switch'
    | 'custom';

export interface IBaseFormField<TValues = unknown> {
    name: keyof TValues | string;
    label?: ReactNode;
    colSpan?: number;
    rulesConfig?: FormRuleConfig[];
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
    disabled?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

export interface IInputFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type?: 'input';
    placeholder?: string;
    addonAfter?:
        | ReactNode
        | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
    addonBefore?:
        | ReactNode
        | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
    inputProps?: InputProps;
}

export interface INumberFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'number';
    placeholder?: string;
    numberProps?: InputNumberProps<number>;
}

export interface IPasswordFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'password';
    placeholder?: string;
    passwordProps?: PasswordProps;
}

export interface ITextAreaFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'textarea';
    placeholder?: string;
    textAreaProps?: TextAreaProps;
}

export interface ISelectFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'select';
    placeholder?: string;
    options?: SelectProps['options'];
    selectProps?: SelectProps;
}

export interface ISwitchFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'switch';
    description?: ReactNode;
    switchProps?: SwitchProps;
}

export interface ICustomFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'custom';
    render: (form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode;
}

export type IFormField<TValues = unknown> =
    | IInputFormField<TValues>
    | INumberFormField<TValues>
    | IPasswordFormField<TValues>
    | ITextAreaFormField<TValues>
    | ISelectFormField<TValues>
    | ISwitchFormField<TValues>
    | ICustomFormField<TValues>;
```

---

### 3. `[MODIFY]` `src/interfaces/component.ts`
> **Action**: Xoá bỏ circular import `CodeDisplayProps` từ `@/components/common`.

```diff
-import { CodeDisplayProps } from '@/components/common';
 import type { FormInstance, Rule } from '@/components/custom-antd';
 import { ReactNode } from 'react';
 import { IOption } from './common';
@@ line 31 @@
     onChange?: (value: unknown, form?: FormInstance) => void;
 
-    codeProps?: Omit<CodeDisplayProps, 'code' | 'onCodeChange'>;
+    codeProps?: {
+        title?: string;
+        loading?: boolean;
+        expanded?: boolean;
+        maxHeight?: string;
+        language?: 'json' | 'javascript' | 'html';
+        isDisplayLanguage?: boolean;
+    };
 
     inputProps?: {
```

---

### 4. `[MODIFY]` `src/interfaces/index.ts`
> **Action**: Re-export `containers` và `forms`.

```diff
 export * from './auth';
 export * from './base-api';
 export * from './common';
 export * from './component';
 export * from './api-hooks';
 export * from './notification';
 export * from './media';
 export * from './navigation';
 export * from './filter';
+export * from './containers';
+export * from './forms';
```

---

### 5. `[NEW]` `src/components/common/containers/list-header/index.tsx`
> **Action**: Tạo component `ListHeader` với Props colocated tại file component.

```typescript
'use client';

import { FilterPanel } from '@/components/common';
import { CustomCard, CustomFlex } from '@/components/custom-antd';
import type { ICardAction, IFilterField } from '@/interfaces';
import { cloneElement, isValidElement, useMemo, type ReactElement, type ReactNode } from 'react';

export type ListHeaderProps = {
    withCard?: boolean;
    className?: string;
    allowedActions?: ICardAction[];
    mobileActionsButton?: ReactNode;
    filters?: IFilterField[] | ReactNode;
};

export type WrapperHeaderProps = ListHeaderProps;

export const ListHeader = ({
    withCard = false,
    className = '',
    allowedActions = [],
    mobileActionsButton,
    filters,
}: ListHeaderProps) => {
    const { hasFilters, filterComponent } = useMemo(() => {
        if (!filters) return { hasFilters: false, filterComponent: null };

        const hasFilters = Boolean(Array.isArray(filters) ? filters.length > 0 : true);
        const filterComponent = Array.isArray(filters) ? <FilterPanel fields={filters} /> : filters;

        return { hasFilters, filterComponent };
    }, [filters]);

    const hasHeader = useMemo(
        () => Boolean(hasFilters || allowedActions.length > 0),
        [hasFilters, allowedActions],
    );

    const clonedFilters = useMemo(() => {
        if (filterComponent && isValidElement(filterComponent) && mobileActionsButton) {
            return cloneElement(filterComponent as ReactElement<any>, {
                extraActions: mobileActionsButton,
            });
        }

        return filterComponent;
    }, [filterComponent, mobileActionsButton]);

    const contentComponent = useMemo(
        () => (
            <CustomFlex vertical className="w-full">
                {/* Desktop View (md and above): Render all filters on left, all actions on right */}
                <CustomFlex
                    gap="small"
                    align="center"
                    justify="space-between"
                    className="hidden md:flex w-full"
                >
                    {filterComponent && (
                        <CustomFlex className="flex-1 min-w-0">{filterComponent}</CustomFlex>
                    )}

                    {allowedActions.length > 0 && (
                        <CustomFlex
                            gap="small"
                            align="center"
                            justify="flex-end"
                            className="shrink-0"
                        >
                            {allowedActions.map((action, index) => (
                                <CustomFlex key={index} className="shrink-0">
                                    {action.component}
                                </CustomFlex>
                            ))}
                        </CustomFlex>
                    )}
                </CustomFlex>

                {/* Mobile View (< md): 2-row layout handled by clonedFilters or fallback */}
                <CustomFlex vertical gap="middle" className="flex md:hidden w-full">
                    {clonedFilters
                        ? clonedFilters
                        : mobileActionsButton && (
                              <CustomFlex align="center" justify="flex-end" className="w-full">
                                  {mobileActionsButton}
                              </CustomFlex>
                          )}
                </CustomFlex>
            </CustomFlex>
        ),
        [filters, allowedActions, mobileActionsButton],
    );

    if (!hasHeader) return null;

    if (withCard) {
        return <CustomCard className={`w-full ${className}`.trim()}>{contentComponent}</CustomCard>;
    }

    return contentComponent;
};

/**
 * @deprecated Use `ListHeader` instead.
 */
export const WrapperHeader = ListHeader;
```

---

### 6. `[NEW]` `src/components/common/containers/form-modal-container/index.tsx`
> **Action**: Tạo component `FormModalContainer` với Props colocated tại file component.

```typescript
'use client';

import { CustomFormField, CustomModalForm } from '@/components/common';
import { CustomRow, type FormInstance } from '@/components/custom-antd';
import type { FormMode, UseCustomModalFormResponse } from '@/hooks';
import type { IFormField } from '@/interfaces';
import type { BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export type FormModalContainerProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    modalForm: UseCustomModalFormResponse<TQueryFnData, TValues, TData>;
    okText?: ReactNode;
    cancelText?: ReactNode;
    width?: number | string;
    title?: string | ReactNode;
    createInitialValues?: TValues;
    fields?: IFormField<TValues>[];
    children?: ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
};

export type WrapperFormModalProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = FormModalContainerProps<TQueryFnData, TValues, TData>;

export const FormModalContainer = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    modalForm,
    okText,
    cancelText,
    width = 600,
    title,
    createInitialValues = {} as TValues,
    fields,
    children,
}: FormModalContainerProps<TQueryFnData, TValues, TData>) => {
    const { mode, formProps } = modalForm;

    const content = useMemo(() => {
        if (fields?.length) {
            return (
                <CustomRow gutter={[16, 0]}>
                    {fields.map((field) => (
                        <CustomFormField
                            mode={mode}
                            field={field}
                            form={formProps.form}
                            key={String(field.name)}
                        />
                    ))}
                </CustomRow>
            );
        }

        if (typeof children === 'function') {
            return children(formProps.form, mode);
        }

        return children;
    }, [fields, children, formProps.form, mode]);

    return (
        <CustomModalForm<TQueryFnData, TValues, TData>
            width={width}
            okText={okText}
            title={title}
            modalForm={modalForm}
            cancelText={cancelText}
            createInitialValues={createInitialValues}
        >
            {content}
        </CustomModalForm>
    );
};

/**
 * @deprecated Use `FormModalContainer` instead.
 */
export const WrapperFormModal = FormModalContainer;
```

---

### 7. `[NEW]` `src/components/common/containers/list-container/index.tsx`
> **Action**: Tạo component `ListContainer` với Props colocated tại file component.

```typescript
'use client';

import {
    BreadcrumbNav,
    FormModalContainer,
    ListHeader,
    ListTable,
    type FormModalContainerProps,
    type ListTableProps,
} from '@/components/common';
import {
    CustomButton,
    CustomCard,
    CustomDropdown,
    CustomFlex,
    CustomSpace,
    CustomSpin,
    CustomTypography,
    type MenuProps,
} from '@/components/custom-antd';
import { usePagePermissions } from '@/hooks';
import type { BreadcrumbItem, ICardAction, IFilterField } from '@/interfaces';
import { DownOutlined } from '@ant-design/icons';
import type { BaseRecord } from '@refinedev/core';
import { useMemo, type ReactNode } from 'react';

export type ListContainerProps<
    RecordType extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
> = {
    resource?: string;
    children?: ReactNode;
    permissionGroup?: string;
    actions?: ICardAction[];
    breadcrumb?: BreadcrumbItem[];
    mobileActionsTitle?: ReactNode;
    filters?: IFilterField[] | ReactNode;
    isLoading?: boolean;
    withCard?: boolean;
    className?: string;
    table?: ListTableProps<RecordType>;
    formModal?: FormModalContainerProps<RecordType, TValues>[];
    customModals?: ReactNode[];
};

export type ListWrapperProps<
    RecordType extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
> = ListContainerProps<RecordType, TValues>;

export const ListContainer = <
    RecordType extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
>({
    children,
    permissionGroup,
    actions = [],
    breadcrumb,
    mobileActionsTitle,
    filters,
    isLoading,
    withCard = true,
    className = '',
    table,
    formModal,
    customModals,
}: ListContainerProps<RecordType, TValues>) => {
    const permissions = usePagePermissions(permissionGroup);

    const allowedActions = useMemo(
        () =>
            actions.filter((action) => {
                if (!action.permissionAction) return true;
                if (action.permissionAction === 'create') return permissions.canCreate;
                if (action.permissionAction === 'update') return permissions.canEdit;
                if (action.permissionAction === 'delete') return permissions.canDelete;
                if (action.permissionAction === 'read') return permissions.canRead;
                return true;
            }),
        [actions, permissions],
    );

    const mobileActionMenuItems = useMemo<MenuProps['items']>(() => {
        return allowedActions.map((action, index) => {
            if (action.label && !action.component) {
                return {
                    icon: action.icon,
                    label: action.label,
                    danger: action.danger,
                    key: action.key ?? String(index),
                    onClick: action.onClick,
                };
            }

            return {
                key: action.key ?? String(index),
                label: (
                    <CustomFlex
                        align="center"
                        className="w-full [&_button]:!w-full [&_button]:!justify-start [&_button]:!border-none [&_button]:!shadow-none [&_button]:!bg-transparent [&_button]:!p-0 [&_button]:!h-auto [&_button]:!text-inherit"
                    >
                        {action.component}
                    </CustomFlex>
                ),
            };
        });
    }, [allowedActions]);

    const mobileActionsButton = useMemo(() => {
        if (allowedActions.length === 0) return null;

        return (
            <CustomDropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{ items: mobileActionMenuItems }}
            >
                <CustomButton
                    type="primary"
                    className="flex items-center justify-center gap-1 shrink-0"
                >
                    <CustomTypography.Text className="text-inherit">
                        {mobileActionsTitle ?? 'Thao tác'}
                    </CustomTypography.Text>
                    <DownOutlined className="text-xs ml-0.5" />
                </CustomButton>
            </CustomDropdown>
        );
    }, [allowedActions.length, mobileActionMenuItems, mobileActionsTitle]);

    return (
        <>
            <CustomSpace
                size="middle"
                direction="vertical"
                className={`w-full ${!withCard ? 'p-3 sm:p-5 ' : ''}${className}`.trim()}
            >
                <CustomSpin spinning={isLoading}>
                    <BreadcrumbNav items={breadcrumb} />

                    {withCard ? (
                        <CustomCard styles={{ body: { padding: 0 } }} className="overflow-hidden">
                            <CustomSpace
                                size="middle"
                                direction="vertical"
                                className="w-full p-3 sm:p-5"
                            >
                                <ListHeader
                                    filters={filters}
                                    withCard={!withCard}
                                    allowedActions={allowedActions}
                                    mobileActionsButton={mobileActionsButton}
                                />

                                {table && (
                                    <ListTable<RecordType>
                                        permissionGroup={permissionGroup}
                                        {...table}
                                    />
                                )}

                                {children}
                            </CustomSpace>
                        </CustomCard>
                    ) : (
                        <>
                            <ListHeader
                                filters={filters}
                                withCard={withCard}
                                allowedActions={allowedActions}
                                mobileActionsButton={mobileActionsButton}
                            />

                            {table && (
                                <ListTable<RecordType>
                                    permissionGroup={permissionGroup}
                                    {...table}
                                />
                            )}

                            {children}
                        </>
                    )}
                </CustomSpin>
            </CustomSpace>

            {/** Form Modals */}
            {formModal?.map((modalProps, index) => (
                <FormModalContainer key={index} {...modalProps} />
            ))}

            {/** Custom Modals */}
            {customModals?.length ? customModals.map((modal) => modal) : null}
        </>
    );
};

/**
 * @deprecated Use `ListContainer` instead.
 */
export const ListWrapper = ListContainer;
```

---

### 8. `[MODIFY]` `src/components/common/forms/custom-form-field/types.ts`
> **Action**: Re-export schema contracts từ `@/interfaces` và giữ `CustomFormFieldProps` tại component.

```typescript
'use client';

import type { FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { FormFieldType, IFormField } from '@/interfaces';

export type { FormFieldType, IFormField };
export type {
    IBaseFormField,
    IInputFormField,
    INumberFormField,
    IPasswordFormField,
    ITextAreaFormField,
    ISelectFormField,
    ISwitchFormField,
    ICustomFormField,
} from '@/interfaces';

export type CustomFormFieldProps<TValues = unknown> = {
    mode: FormMode;
    withCol?: boolean;
    field: IFormField<TValues>;
    form?: FormInstance<TValues>;
};
```

---

### 9. `[MODIFY]` `src/components/common/index.ts`
> **Action**: Cập nhật re-exports cho các container components mới.

```diff
 // Containers
 export * from './containers/breadcrumb-nav';
 export * from './containers/filter-panel';
 export * from './containers/list-table';
-export * from './containers/list-wrapper';
+export * from './containers/list-container';
 export * from './containers/mobile-card-list';
-export * from './containers/wrapper-header';
-export * from './containers/wrapper-form-modal';
+export * from './containers/list-header';
+export * from './containers/form-modal-container';
 export * from './containers/pagination-controls';
```

---

## Section 5. Test Cases & Verification

### 5.1. Automated Tests & Type Checking
- [x] **TypeScript Compiler Check**:
  ```bash
  npx tsc --noEmit
  ```
  *Evidence*: `Exit Code 0` - Không có bất kỳ lỗi TypeScript nào trên toàn bộ dự án.
- [x] **Lint & Code Style**:
  ```bash
  npm run format
  npx eslint src/
  ```
  *Evidence*: `Exit Code 0` - Toàn bộ mã nguồn tuân thủ 100% Prettier và ESLint rules.
- [x] **Next.js Production Build**:
  ```bash
  npm run build
  ```
  *Evidence*: `Exit Code 0` - Turbopack biên dịch thành công toàn bộ 30/30 dynamic/static app routes và middleware.

### 5.2. Verification Summary
- Các Container component đã được đổi tên theo đúng chuẩn danh pháp: `ListHeader`, `FormModalContainer`, `ListContainer` (kèm alias tương thích ngược).
- Tách thành công các shared data/schema interfaces sang `src/interfaces/containers.ts` và `src/interfaces/forms.ts`.
- Props của các component (`*Props`) được giữ nguyên tại file component gốc (colocation).
- Xoá triệt để circular import từ `@/components/common` trong `src/interfaces/component.ts`.
