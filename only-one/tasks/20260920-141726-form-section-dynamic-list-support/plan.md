---
status: done
slug: 20260920-141726-form-section-dynamic-list-support
started_at: 2026-09-20
completed_at: 2026-09-20
pr_url: ~
branch: ~
---

# Plan: Hỗ trợ Dynamic Form List (Mảng động các trường) trong CustomFormSection

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- `CustomFormSection` phối hợp với `CustomFormField` để render form theo cấu trúc declarative schema (`IFormSection[]`), nhưng `IFormField` hiện chỉ hỗ trợ các primitive input đơn lẻ (`input`, `number`, `password`, `select`, `date_picker`, `upload`...).
- Khi gặp trường dữ liệu dạng mảng động (Array of Objects như `credentials: [{ username, password }]`), các module (tiêu biểu là `DeviceApproachModal.tsx`) buộc phải dùng escape hatch `type: 'custom'` và viết lặp lại 40+ dòng boilerplate JSX (`CustomFormList`, `fields.map`, `CustomForm.Item`, các input con, delete button, layout).
- **Invariants bắt buộc duy trì**:
  - Không phá vỡ các field type hiện có trong `FormFieldType` và `CustomFormField`.
  - Giữ nguyên cơ chế tương thích ngược cho `type: 'custom'` và các form sections hiện có (`card`, `plain`, `collapse`, `tabs`).
  - Đảm bảo Ant Design `Form.List` quản lý đúng đường dẫn field name phân cấp `[name, subField.name]` để validate và submit đúng payload JSON array.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)
*(Kế thừa 100% cơ chế vận hành từ concept.md; tuyệt đối không mô tả lại giải pháp tổng quan)*

- **Type Signatures & Code Contracts**:
  - Mở rộng `FormFieldType` với type `'list'`.
  - Cập nhật `IBaseFormField.name` thành `keyof TValues | string | (string | number)[]` (tương thích `FormItemProps['name']`).
  - Định nghĩa interface `IListFormField<TValues = unknown>`:
    ```typescript
    export interface IListFormField<TValues = unknown> extends IBaseFormField<TValues> {
        type: 'list';
        subFields: IFormField<TValues>[];
        addText?: string;
        emptyText?: string;
        allowAdd?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
        allowRemove?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
        min?: number;
        max?: number;
        gutter?: [number, number];
        itemLayout?: 'row' | 'card';
    }
    ```
  - Cập nhật union `IFormField<TValues>` bao gồm `IListFormField<TValues>`.
- **AST Seams & Callers**:
  - `src/interfaces/forms.ts`: Bổ sung `IListFormField` và cập nhật `FormFieldType`, `IFormField`.
  - `src/components/common/forms/custom-form-list-field/index.tsx`: Component nguyên tử `CustomFormListField` quản lý `CustomForm.List`, các row sub-fields, delete/add triggers và responsive layout.
  - `src/components/common/forms/custom-form-field/index.tsx`: Nhánh `case 'list':` trong switch dispatcher để render `CustomFormListField`.
  - `src/components/common/index.ts`: Export `CustomFormListField`.
  - `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`: Refactor field `credentials` từ `type: 'custom'` sang `type: 'list'`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes (Cấu trúc Thư mục & Tệp Thay đổi)

```text
src/
├── interfaces/
│   └── [MODIFY] forms.ts                     # Mở rộng FormFieldType và IListFormField
└── components/common/
    ├── [NEW]    forms/custom-form-list-field/
    │   └── index.tsx                         # Component atomic render Form.List với subFields
    ├── [MODIFY] forms/custom-form-field/
    │   └── index.tsx                         # Bổ sung case 'list' vào dispatcher
    ├── [MODIFY] index.ts                     # Barrel export CustomFormListField
    └── (root)/tool/network-device/components/
        └── [MODIFY] DeviceApproachModal.tsx  # Chuyển đổi credentials sang schema declarative
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | `FormFieldType`, `IBaseFormField`, `IListFormField`, `IFormField` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-list-field/index.tsx` | `CustomFormListField` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Barrel export `custom-form-list-field` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-form-field/index.tsx` | `CustomFormField`, `renderFieldContent` | `Order 2, 3` | `npx tsc --noEmit` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx` | `credentials` field definition | `Order 4` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Mở rộng `IBaseFormField`, định nghĩa `IListFormField` và cập nhật `FormFieldType`, `IFormField`.

```diff
@@ -45,3 +45,4 @@
     | 'radio_group'
     | 'checkbox_group'
+    | 'list'
     | 'custom';

 export interface IBaseFormField<TValues = unknown> {
-    name: keyof TValues | string;
+    name: keyof TValues | string | (string | number)[];
     label?: ReactNode;
@@ -154,2 +155,14 @@
 export interface ICheckboxGroupFormField<TValues = unknown> extends IBaseFormField<TValues> {
     type: 'checkbox_group';
     options?: ComponentProps<typeof CustomCheckbox.Group>['options'];
     checkboxGroupProps?: ComponentProps<typeof CustomCheckbox.Group>;
 }
+
+export interface IListFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'list';
+    subFields: IFormField<TValues>[];
+    addText?: string;
+    emptyText?: string;
+    allowAdd?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+    allowRemove?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+    min?: number;
+    max?: number;
+    gutter?: [number, number];
+    itemLayout?: 'row' | 'card';
+}
 
 export type IFormField<TValues = unknown> =
     | IInputFormField<TValues>
@@ -169,3 +182,4 @@
     | IRadioGroupFormField<TValues>
     | ICheckboxGroupFormField<TValues>
+    | IListFormField<TValues>
     | ICustomFormField<TValues>;
```

---

### 2. `[NEW]` `src/components/common/forms/custom-form-list-field/index.tsx`
> **Action**: Tạo component nguyên tử `CustomFormListField` hỗ trợ render danh sách động theo sub-fields schema.

```tsx
'use client';

import {
    CustomButton,
    CustomCard,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import type { FormMode } from '@/hooks';
import type { IListFormField } from '@/interfaces';
import { CustomFormField } from '../custom-form-field';
import { useMemo } from 'react';

const { Text } = CustomTypography;

export type CustomFormListFieldProps<TValues extends object = Record<string, unknown>> = {
    field: IListFormField<TValues>;
    mode: FormMode;
    form?: FormInstance<TValues>;
};

export const CustomFormListField = <TValues extends object = Record<string, unknown>>({
    field,
    mode,
    form,
}: CustomFormListFieldProps<TValues>) => {
    const {
        name,
        label,
        subFields,
        addText = 'Thêm mục mới',
        emptyText = 'Chưa có mục nào được thêm.',
        allowAdd = true,
        allowRemove = true,
        min,
        max,
        gutter = [12, 8],
        itemLayout = 'row',
        disabled,
    } = field;

    const isFieldDisabled = useMemo(
        () => (typeof disabled === 'function' ? disabled(mode, form) : Boolean(disabled)),
        [disabled, mode, form],
    );

    const isAddAllowed = useMemo(() => {
        if (mode === 'view' || isFieldDisabled) return false;
        return typeof allowAdd === 'function' ? allowAdd(mode, form) : Boolean(allowAdd);
    }, [allowAdd, mode, form, isFieldDisabled]);

    const isRemoveAllowed = useMemo(() => {
        if (mode === 'view' || isFieldDisabled) return false;
        return typeof allowRemove === 'function' ? allowRemove(mode, form) : Boolean(allowRemove);
    }, [allowRemove, mode, form, isFieldDisabled]);

    return (
        <CustomFlex vertical gap={8} className="w-full">
            {label && (
                <Text strong className="text-xs text-hub-text-secondary">
                    {label}
                </Text>
            )}

            <CustomForm.List name={name}>
                {(fields, operation) => {
                    const canAdd = isAddAllowed && (max === undefined || fields.length < max);
                    const canRemove = isRemoveAllowed && (min === undefined || fields.length > min);

                    return (
                        <CustomFlex vertical gap={10} className="w-full">
                            {fields.length === 0 && (
                                <div className="py-3 px-4 text-center rounded-lg border border-dashed border-hub-border text-hub-text-tertiary text-xs bg-hub-card/20">
                                    {emptyText}
                                </div>
                            )}

                            {fields.map((fieldData) => {
                                const renderSubFields = (
                                    <CustomRow gutter={gutter} className="flex-1 w-full" align="middle">
                                        {subFields.map((subField) => {
                                            const subFieldName = Array.isArray(subField.name)
                                                ? [fieldData.name, ...subField.name]
                                                : [fieldData.name, subField.name];

                                            return (
                                                <CustomFormField
                                                    key={`${fieldData.key}-${String(subField.name)}`}
                                                    mode={mode}
                                                    form={form}
                                                    withCol={true}
                                                    field={{
                                                        ...subField,
                                                        name: subFieldName,
                                                        disabled: isFieldDisabled || subField.disabled,
                                                    }}
                                                />
                                            );
                                        })}
                                    </CustomRow>
                                );

                                if (itemLayout === 'card') {
                                    return (
                                        <CustomCard
                                            key={fieldData.key}
                                            size="small"
                                            className="relative border-hub-border/60 bg-hub-card/30"
                                            extra={
                                                canRemove && (
                                                    <CustomButton
                                                        danger
                                                        type="text"
                                                        size="small"
                                                        icon={<Icon icon="mdi:delete-outline" className="text-base" />}
                                                        onClick={() => operation.remove(fieldData.name)}
                                                    />
                                                )
                                            }
                                        >
                                            {renderSubFields}
                                        </CustomCard>
                                    );
                                }

                                return (
                                    <CustomFlex
                                        key={fieldData.key}
                                        gap="small"
                                        align="start"
                                        className="w-full items-center"
                                    >
                                        {renderSubFields}
                                        {canRemove && (
                                            <CustomButton
                                                danger
                                                type="text"
                                                icon={<Icon icon="mdi:delete-outline" className="text-base" />}
                                                className="mt-1"
                                                onClick={() => operation.remove(fieldData.name)}
                                            />
                                        )}
                                    </CustomFlex>
                                );
                            })}

                            {canAdd && (
                                <CustomButton
                                    block
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => operation.add()}
                                    className="border-hub-border/80 hover:border-hub-primary"
                                >
                                    {addText}
                                </CustomButton>
                            )}
                        </CustomFlex>
                    );
                }}
            </CustomForm.List>
        </CustomFlex>
    );
};
```

---

### 3. `[MODIFY]` `src/components/common/index.ts`
> **Action**: Export `custom-form-list-field` từ barrel file.

```diff
@@ -33,2 +33,3 @@
 export * from './forms/custom-form-list';
+export * from './forms/custom-form-list-field';
 export * from './forms/custom-form-section';
```

---

### 4. `[MODIFY]` `src/components/common/forms/custom-form-field/index.tsx`
> **Action**: Tích hợp `CustomFormListField` vào dispatcher `CustomFormField`.

```diff
@@ -16,2 +16,3 @@
     CustomUpload,
+    CustomFormListField,
 } from '@/components/common';
@@ -28,2 +29,3 @@
     IInputFormField,
     IJsonToggleFormField,
+    IListFormField,
     INumberFormField,
@@ -296,2 +298,9 @@
             }
+            case 'list': {
+                const listField = field as IListFormField<TValues>;
+                return (
+                    <CustomFormListField
+                        field={listField}
+                        form={form}
+                        mode={mode}
+                    />
+                );
+            }
             case 'input':
```

---

### 5. `[MODIFY]` `src/app/(root)/tool/network-device/components/DeviceApproachModal.tsx`
> **Action**: Chuyển đổi field `credentials` sang khai báo `type: 'list'` ngắn gọn và xóa các import JSX thủ công không còn dùng.

```diff
@@ -87,47 +87,24 @@
                     {
                         name: 'credentials',
-                        type: 'custom',
+                        type: 'list',
+                        label: 'Danh sách Tài khoản Xác thực (Credentials)',
                         visible: currentApproach === NetworkDeviceApproachEnum.PROTOCOL_AUTH,
-                        render: () => (
-                            <div>
-                                <Text strong className="block mb-2 text-xs">
-                                    Danh sách Tài khoản Xác thực (Credentials):
-                                </Text>
-                                <CustomFormList name="credentials" addText="Thêm Credential">
-                                    {(fields, { remove }) => (
-                                        <CustomSpace direction="vertical" className="w-full">
-                                            {fields.map(({ key, name, ...restField }) => (
-                                                <CustomFlex key={key} gap="small" align="center">
-                                                    <CustomForm.Item
-                                                        {...restField}
-                                                        name={[name, 'username']}
-                                                        className="!mb-0 flex-1"
-                                                        rules={[
-                                                            {
-                                                                required: true,
-                                                                message: 'Nhập username',
-                                                            },
-                                                        ]}
-                                                    >
-                                                        <CustomInput placeholder="Username" />
-                                                    </CustomForm.Item>
-                                                    <CustomForm.Item
-                                                        {...restField}
-                                                        name={[name, 'password']}
-                                                        className="!mb-0 flex-1"
-                                                    >
-                                                        <CustomInput.Password placeholder="Password (để trống nếu ko có)" />
-                                                    </CustomForm.Item>
-                                                    <CustomButton
-                                                        danger
-                                                        type="text"
-                                                        icon={<Icon icon="mdi:delete" />}
-                                                        onClick={() => remove(name)}
-                                                    />
-                                                </CustomFlex>
-                                            ))}
-                                        </CustomSpace>
-                                    )}
-                                </CustomFormList>
-                            </div>
-                        ),
+                        addText: 'Thêm Credential',
+                        subFields: [
+                            {
+                                name: 'username',
+                                placeholder: 'Username',
+                                type: 'input',
+                                colSpan: 11,
+                                rulesConfig: [
+                                    {
+                                        required: true,
+                                        message: 'Nhập username',
+                                    },
+                                ],
+                            },
+                            {
+                                name: 'password',
+                                placeholder: 'Password (để trống nếu ko có)',
+                                type: 'password',
+                                colSpan: 11,
+                            },
+                        ],
                     },
```

---

## Section 5. Test Cases & Verification

- **Automated Tests**:
  - `[x]` `npx tsc --noEmit` (PASS - Exit code 0, 100% type safety và JSX prop contracts).
  - `[x]` `npm run lint:fix` & `npx eslint "src/**/*.{ts,tsx}"` (PASS - Exit code 0, 0 errors, 0 warnings).
- **Manual Checks**:
  - `[x]` Schema `credentials` trong `DeviceApproachModal` được khai báo tinh gọn bằng `type: 'list'` với `subFields: [{ name: 'username', ... }, { name: 'password', ... }]`.
  - `[x]` `CustomFormListField` tự động quản lý name prefixing theo mảng, responsive layout row/grid, nút thêm và nút xóa.
