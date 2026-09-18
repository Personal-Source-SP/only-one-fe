# Debug: Lỗi Cú pháp và Thiếu Thành phần Custom Form Trong CustomFormField

---
status: fixed
slug: custom-form-field-missing-components
started_at: 2026-09-18 15:42:00
completed_at: 2026-09-18 15:48:30
reproduction_test: npx tsc --noEmit
---

## Section 1. Symptom & Red Feedback Loop (Triệu chứng & Tái hiện Lỗi)
- **Triệu chứng & Stack Trace**:
  - `src/components/common/forms/custom-form-field/index.tsx:61:22 - error TS1003: Identifier expected.` do dấu phẩy thừa (`IUploadFormField,,`).
  - Một số input types (`date_picker`, `html_editor`, `code_editor`, `radio_group`, `checkbox_group`) trong `CustomFormField` đang được triển khai inline với `CustomForm.Item` trực tiếp, chưa được đóng gói thành các custom form component chuyên biệt trong `src/components/common/forms/` theo đúng design pattern đồng nhất (`CustomInputForm`, `CustomSelectInput`, `CustomSwitchForm`, `CustomRangePicker`, `CustomUpload`, `CustomJsonToggleForm`).
- **Red Test Case**: Lệnh TypeScript typecheck phát hiện lỗi cú pháp và thiếu tính đóng gói nhất quán.
- **Lệnh chạy tái hiện**: `npx tsc --noEmit`

## Section 2. Root Cause Analysis & Proposed Solution (Phân tích & Đề xuất Giải pháp)
### 2.1 Mechanical Root Cause & Invariants
- **Cơ chế lỗi cốt lõi (Mechanical Root Cause)**:
  1. Dấu phẩy kép thừa `IUploadFormField,,` tại line 61 của [custom-form-field/index.tsx](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/index.tsx#L61) gây lỗi cú pháp TypeScript AST Parser.
  2. Sự thiếu nhất quán trong kiến trúc tầng form: Trong khi các field `input`, `select`, `switch`, `range_picker`, `upload`, `json_toggle` đã có component wrapper chuyên biệt trong thư mục `src/components/common/forms/`, thì các field `date_picker`, `html_editor`, `code_editor`, `radio_group`, `checkbox_group` vẫn còn viết inline thẻ `<CustomForm.Item>` bên trong `CustomFormField`.
- **Invariants bị vi phạm**:
  - `CustomFormField` chỉ đóng vai trò coordinator / dispatcher dựa trên `field.type`, không trực tiếp render inline cấu trúc form item hoặc quản lý component con cấp thấp.
  - Mọi custom form component dùng chung phải có folder riêng trong `src/components/common/forms/`, export qua barrel file `src/components/common/index.ts`.

### 2.2 Proposed Solution & Target Source Structure
- **Cơ chế giải pháp cốt lõi (Core Fix Mechanism)**:
  1. Xóa dấu phẩy thừa tại line 61 `custom-form-field/index.tsx`.
  2. Tạo 5 custom form components độc lập trong `src/components/common/forms/`:
     - `custom-date-picker-form`: Chứa `CustomDatePickerForm`.
     - `custom-html-editor-form`: Chứa `CustomHtmlEditorForm`.
     - `custom-code-editor-form`: Chứa `CustomCodeEditorForm`.
     - `custom-radio-group-form`: Chứa `CustomRadioGroupForm`.
     - `custom-checkbox-group-form`: Chứa `CustomCheckboxGroupForm`.
  3. Export 5 components mới tại [src/components/common/index.ts](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/index.ts).
  4. Refactor [CustomFormField](file:///Users/kiem/Sources/PERSONAL/only-one-fe/src/components/common/forms/custom-form-field/index.tsx) để import và ủy quyền render cho các custom component mới, dọn sạch code inline.

- **Cấu trúc tệp thay đổi (Source Structure Changes)**:
```text
src/components/common/
├── forms/
│   ├── [NEW]    custom-date-picker-form/index.tsx     # Wrapper CustomForm.Item + CustomPicker
│   ├── [NEW]    custom-html-editor-form/index.tsx     # Wrapper CustomForm.Item + HtmlEditor
│   ├── [NEW]    custom-code-editor-form/index.tsx     # Wrapper CustomForm.Item + CodeDisplay
│   ├── [NEW]    custom-radio-group-form/index.tsx     # Wrapper CustomForm.Item + CustomRadio.Group
│   ├── [NEW]    custom-checkbox-group-form/index.tsx  # Wrapper CustomForm.Item + CustomCheckbox.Group
│   └── [MODIFY] custom-form-field/index.tsx           # Fix syntax & dispatch sang 5 custom components
└── [MODIFY] index.ts                                  # Export 5 form components mới
```

## Section 3. Task Matrix & Dependency Graph
| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/components/common/forms/custom-date-picker-form/index.tsx` | `CustomDatePickerForm`, `CustomDatePickerFormProps` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/components/common/forms/custom-html-editor-form/index.tsx` | `CustomHtmlEditorForm`, `CustomHtmlEditorFormProps` | `None` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/components/common/forms/custom-code-editor-form/index.tsx` | `CustomCodeEditorForm`, `CustomCodeEditorFormProps` | `None` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/components/common/forms/custom-radio-group-form/index.tsx` | `CustomRadioGroupForm`, `CustomRadioGroupFormProps` | `None` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/components/common/forms/custom-checkbox-group-form/index.tsx` | `CustomCheckboxGroupForm`, `CustomCheckboxGroupFormProps` | `None` | `npx tsc --noEmit` |
| **6** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Barrel exports for new custom form components | `Order 1-5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-form-field/index.tsx` | `CustomFormField` switch-case delegates | `Order 6` | `npx tsc --noEmit` |

## Section 4. Code Changes (Unified Diff & Chi tiết Thay đổi)

### 1. `[NEW]` `src/components/common/forms/custom-date-picker-form/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Tạo component `CustomDatePickerForm` đóng gói `CustomForm.Item` và `CustomPicker`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ file mới.
- **Chi tiết mã nguồn**:
```tsx
'use client';

import {
    CustomForm,
    CustomPicker,
    type FormItemProps,
} from '@/components/custom-antd';
import { useMemo, type ComponentProps, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomDatePickerFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    pickerProps?: ComponentProps<typeof CustomPicker>;
    placeholder?: string;
    disabled?: boolean;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomDatePickerForm = ({
    label,
    name,
    rulesConfig,
    pickerProps,
    placeholder,
    disabled = false,
    formItemProps,
}: CustomDatePickerFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomPicker
                className="w-full"
                disabled={disabled}
                placeholder={placeholder}
                {...pickerProps}
            />
        </CustomForm.Item>
    );
};
```

### 2. `[NEW]` `src/components/common/forms/custom-html-editor-form/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Tạo component `CustomHtmlEditorForm` đóng gói `CustomForm.Item` và `HtmlEditor`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ file mới.
- **Chi tiết mã nguồn**:
```tsx
'use client';

import { HtmlEditor, type HtmlEditorProps } from '@/components/common';
import { CustomForm, type FormItemProps } from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomHtmlEditorFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    editorProps?: Partial<HtmlEditorProps>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomHtmlEditorForm = ({
    label,
    name,
    rulesConfig,
    placeholder,
    rows,
    disabled = false,
    editorProps,
    formItemProps,
}: CustomHtmlEditorFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <HtmlEditor
                disabled={disabled}
                placeholder={placeholder}
                rows={rows}
                {...editorProps}
            />
        </CustomForm.Item>
    );
};
```

### 3. `[NEW]` `src/components/common/forms/custom-code-editor-form/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Tạo component `CustomCodeEditorForm` đóng gói `CustomForm.Item` và `CodeDisplay`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ file mới.
- **Chi tiết mã nguồn**:
```tsx
'use client';

import { CodeDisplay } from '@/components/common';
import { CustomForm, type FormInstance, type FormItemProps } from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomCodeEditorFormProps<TValues = unknown> = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    language?: string;
    maxHeight?: number | string;
    isDisplayLanguage?: boolean;
    disabled?: boolean;
    form?: FormInstance<TValues>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomCodeEditorForm = <TValues extends object = Record<string, unknown>>({
    label,
    name,
    rulesConfig,
    language = 'json',
    maxHeight,
    isDisplayLanguage = true,
    disabled = false,
    form,
    formItemProps,
}: CustomCodeEditorFormProps<TValues>) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);
    const codeValue = form?.getFieldValue(name as any) ?? '';

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CodeDisplay
                code={codeValue}
                language={language}
                maxHeight={maxHeight}
                isDisplayLanguage={isDisplayLanguage}
                onCodeChange={
                    !disabled
                        ? (newCode: string) => form?.setFieldValue(name as any, newCode)
                        : undefined
                }
            />
        </CustomForm.Item>
    );
};
```

### 4. `[NEW]` `src/components/common/forms/custom-radio-group-form/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Tạo component `CustomRadioGroupForm` đóng gói `CustomForm.Item` và `CustomRadio.Group`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ file mới.
- **Chi tiết mã nguồn**:
```tsx
'use client';

import {
    CustomForm,
    CustomRadio,
    type FormItemProps,
    type RadioGroupProps,
} from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomRadioGroupFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    options?: RadioGroupProps['options'];
    radioGroupProps?: RadioGroupProps;
    disabled?: boolean;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomRadioGroupForm = ({
    label,
    name,
    rulesConfig,
    options,
    radioGroupProps,
    disabled = false,
    formItemProps,
}: CustomRadioGroupFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomRadio.Group
                disabled={disabled}
                options={options}
                {...radioGroupProps}
            />
        </CustomForm.Item>
    );
};
```

### 5. `[NEW]` `src/components/common/forms/custom-checkbox-group-form/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Tạo component `CustomCheckboxGroupForm` đóng gói `CustomForm.Item` và `CustomCheckbox.Group`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Toàn bộ file mới.
- **Chi tiết mã nguồn**:
```tsx
'use client';

import {
    CustomCheckbox,
    CustomForm,
    type CheckboxGroupProps,
    type FormItemProps,
} from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomCheckboxGroupFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    options?: CheckboxGroupProps['options'];
    checkboxGroupProps?: CheckboxGroupProps;
    disabled?: boolean;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomCheckboxGroupForm = ({
    label,
    name,
    rulesConfig,
    options,
    checkboxGroupProps,
    disabled = false,
    formItemProps,
}: CustomCheckboxGroupFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomCheckbox.Group
                disabled={disabled}
                options={options}
                {...checkboxGroupProps}
            />
        </CustomForm.Item>
    );
};
```

### 6. `[MODIFY]` `src/components/common/index.ts`
- **Mục đích thay đổi (Action / Rationale)**: Export các custom form components mới qua barrel root `@/components/common`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: `// Forms` section
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -27,7 +27,12 @@
 // Forms
+export * from './forms/custom-checkbox-group-form';
+export * from './forms/custom-code-editor-form';
+export * from './forms/custom-date-picker-form';
 export * from './forms/custom-drawer-form';
 export * from './forms/custom-form-field';
 export * from './forms/custom-form-list';
 export * from './forms/custom-form-section';
+export * from './forms/custom-html-editor-form';
 export * from './forms/custom-input-form';
 export * from './forms/custom-json-toggle-form';
 export * from './forms/custom-modal-form';
+export * from './forms/custom-radio-group-form';
 export * from './forms/custom-range-picker';
 export * from './forms/custom-select-input';
 export * from './forms/custom-switch-form';
```

### 7. `[MODIFY]` `src/components/common/forms/custom-form-field/index.tsx`
- **Mục đích thay đổi (Action / Rationale)**: Fix syntax error tại line 61 và thay thế toàn bộ inline `CustomForm.Item` bằng các custom component tương ứng từ `@/components/common`.
- **Điểm can thiệp (AST Seams / Target Symbols)**: Imports, `renderFieldContent` switch cases.
- **Chi tiết thay đổi mã nguồn**:
```diff
@@ -3,17 +3,17 @@
 import {
-    CodeDisplay,
+    CustomCheckboxGroupForm,
+    CustomCodeEditorForm,
+    CustomDatePickerForm,
+    CustomHtmlEditorForm,
     CustomInputForm,
     CustomInputFormType,
     CustomJsonToggleForm,
+    CustomRadioGroupForm,
     CustomRangePicker,
     CustomSelectInput,
     CustomSwitchForm,
     CustomUpload,
-    HtmlEditor,
 } from '@/components/common';
 import type { FormInstance } from '@/components/custom-antd';
-import {
-    CustomCheckbox,
-    CustomCol,
-    CustomForm,
-    CustomPicker,
-    CustomRadio,
-} from '@/components/custom-antd';
+import { CustomCol } from '@/components/custom-antd';
 import type { FormMode } from '@/hooks';
@@ -58,4 +58,4 @@
     ISwitchFormField,
     ITextAreaFormField,
-    IUploadFormField,,
+    IUploadFormField,
 } from '@/interfaces';
@@ -191,12 +191,11 @@
             case 'date_picker': {
                 const datePickerField = field as IDatePickerFormField<TValues>;
-                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
-                return (
-                    <CustomForm.Item {...formItemProps} name={name} label={label} rules={formRules}>
-                        <CustomPicker
-                            className="w-full"
-                            disabled={isDisabled}
-                            placeholder={datePickerField.placeholder}
-                            {...datePickerField.pickerProps}
-                        />
-                    </CustomForm.Item>
+                return (
+                    <CustomDatePickerForm
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        disabled={isDisabled}
+                        placeholder={datePickerField.placeholder}
+                        pickerProps={datePickerField.pickerProps}
+                    />
                 );
@@ -219,14 +218,12 @@
             case 'html_editor': {
                 const htmlField = field as IHtmlEditorFormField<TValues>;
-                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
-
-                return (
-                    <CustomForm.Item {...formItemProps} name={name} label={label} rules={formRules}>
-                        <HtmlEditor
-                            disabled={isDisabled}
-                            placeholder={htmlField.placeholder}
-                            rows={htmlField.rows}
-                            {...htmlField.editorProps}
-                        />
-                    </CustomForm.Item>
+                return (
+                    <CustomHtmlEditorForm
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        disabled={isDisabled}
+                        placeholder={htmlField.placeholder}
+                        rows={htmlField.rows}
+                        editorProps={htmlField.editorProps}
+                    />
                 );
@@ -235,19 +232,14 @@
             case 'code_editor': {
                 const codeField = field as ICodeEditorFormField<TValues>;
-                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
-                const codeValue = form?.getFieldValue(name) ?? '';
-
-                return (
-                    <CustomForm.Item {...formItemProps} name={name} label={label} rules={formRules}>
-                        <CodeDisplay
-                            code={codeValue}
-                            language={codeField.language}
-                            maxHeight={codeField.maxHeight}
-                            isDisplayLanguage={codeField.isDisplayLanguage ?? true}
-                            onCodeChange={
-                                !isDisabled
-                                    ? (newCode: string) => form?.setFieldValue(name, newCode)
-                                    : undefined
-                            }
-                        />
-                    </CustomForm.Item>
+                return (
+                    <CustomCodeEditorForm
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        disabled={isDisabled}
+                        language={codeField.language}
+                        maxHeight={codeField.maxHeight}
+                        isDisplayLanguage={codeField.isDisplayLanguage}
+                        form={form}
+                    />
                 );
@@ -273,11 +265,11 @@
             case 'radio_group': {
                 const radioField = field as IRadioGroupFormField<TValues>;
-                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
-                return (
-                    <CustomForm.Item {...formItemProps} name={name} label={label} rules={formRules}>
-                        <CustomRadio.Group
-                            disabled={isDisabled}
-                            options={radioField.options}
-                            {...radioField.radioGroupProps}
-                        />
-                    </CustomForm.Item>
+                return (
+                    <CustomRadioGroupForm
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        disabled={isDisabled}
+                        options={radioField.options}
+                        radioGroupProps={radioField.radioGroupProps}
+                    />
                 );
@@ -286,11 +278,11 @@
             case 'checkbox_group': {
                 const checkboxField = field as ICheckboxGroupFormField<TValues>;
-                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
-                return (
-                    <CustomForm.Item {...formItemProps} name={name} label={label} rules={formRules}>
-                        <CustomCheckbox.Group
-                            disabled={isDisabled}
-                            options={checkboxField.options}
-                            {...checkboxField.checkboxGroupProps}
-                        />
-                    </CustomForm.Item>
+                return (
+                    <CustomCheckboxGroupForm
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        disabled={isDisabled}
+                        options={checkboxField.options}
+                        checkboxGroupProps={checkboxField.checkboxGroupProps}
+                    />
                 );
```

## Section 5. Verification & Regression Guard
- **Automated Tests**:
  - `[x]` `npx tsc --noEmit`: `PASS (Green - 0 errors)`
  - `[x]` `npm run lint:fix`: `PASS (Green - 0 errors)`
- **Bài học kinh nghiệm (Lessons Learned)**:
  - Khi mở rộng các loại input form trong `CustomFormField`, luôn tạo custom component wrapper độc lập có folder riêng trong `src/components/common/forms/` để đảm bảo tính module hóa và nhất quán kiến trúc.
