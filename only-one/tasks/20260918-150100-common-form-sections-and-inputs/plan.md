---
status: done
slug: common-form-sections-and-inputs
started_at: 2026-09-18
completed_at: 2026-09-18
pr_url: ~
branch: ~
---

# Plan: Chuẩn hoá Hệ thống IFormSection Đa hình & Mở rộng Input Types cho Common Forms

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Cơ chế hiện tại**: `FormModalContainer` hiện chỉ nhận mảng phẳng `fields: IFormField[]` và trực tiếp map từng phần tử qua `CustomFormField` trong một `CustomRow` duy nhất, không hỗ trợ phân chia cấu trúc form theo section.
- **Điểm nghẽn kỹ thuật**:
  - Không có định nghĩa phân cấp polymorphic `IFormSection` (`card`, `plain`, `collapse`, `tabs`) dựa trên `IBaseFormSection` dùng chung để mô tả cấu trúc form bằng declarative schema.
  - Định nghĩa `IFormField` (`src/interfaces/forms.ts`) và bộ dispatch trong `CustomFormField` (`src/components/common/forms/custom-form-field/index.tsx`) mới chỉ hỗ trợ 7 kiểu cơ bản (`input`, `number`, `password`, `textarea`, `select`, `switch`, `custom`), thiếu các widget thông dụng như `date_picker`, `range_picker`, `upload`, `html_editor`, `code_editor`, `json_toggle`, `radio_group`, `checkbox_group`.
- **Invariants bắt buộc duy trì**:
  - Section-First Architecture: `FormModalContainer` chuẩn hoá sang nhận `sections?: IFormSection<TValues>[]` (và `children`), loại bỏ hoàn toàn prop `fields` để nhất quán 100% về kiến trúc section.
  - Bảo toàn Form State trên Inactive Tabs: Trong `tabs` section, bắt buộc dùng `destroyInactiveTabPane: false` và `forceRender: true` để tránh mất dữ liệu và đảm bảo validation rules trên các tab ẩn vẫn được kiểm tra khi submit.
  - Đơn điểm truy cập (Single Public Entry Point): Toàn bộ logic section được đóng gói và xuất nhập duy nhất qua component điều phối `CustomFormSection` tại `src/components/common/forms/custom-form-section/index.tsx`.
  - Tuân thủ Ant Design Wrapper: Sử dụng các wrapper từ `@/components/custom-antd` (`CustomPicker`, `CustomUpload`, `CustomRadio`, `CustomCheckbox`, `CustomTabs`, `CustomFlex`, `CustomRow`, `CustomCol`, `CustomTypography`, `CustomCard`).

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

### 2.1 Type Signatures & Code Contracts

#### `src/interfaces/forms.ts`
```typescript
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

// ==========================================
// FORM FIELD EXTENSIONS
// ==========================================

export interface IDatePickerFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'date_picker';
    placeholder?: string;
    pickerProps?: CustomPickerProps;
}

export interface IRangePickerFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'range_picker';
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
}

export interface IUploadFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'upload';
    uploadProps?: UploadProps;
}

export interface IHtmlEditorFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'html_editor';
    placeholder?: string;
    rows?: number;
    editorProps?: Omit<HtmlEditorProps, 'value' | 'onChange' | 'placeholder' | 'rows' | 'disabled'>;
}

export interface ICodeEditorFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'code_editor';
    language?: 'javascript' | 'json' | 'html';
    maxHeight?: string;
    isDisplayLanguage?: boolean;
}

export interface IJsonToggleFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'json_toggle';
    icon?: string;
    defaultEmptyValue?: string;
    maxHeight?: string;
}

export interface IRadioGroupFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'radio_group';
    options?: CustomRadioGroupProps['options'];
    radioGroupProps?: CustomRadioGroupProps;
}

export interface ICheckboxGroupFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'checkbox_group';
    options?: CustomCheckboxProps[];
    checkboxGroupProps?: ComponentProps<typeof CustomCheckbox.Group>;
}

// ==========================================
// POLYMORPHIC FORM SECTION CONTRACTS
// ==========================================

export type FormSectionType = 'card' | 'plain' | 'collapse' | 'tabs';

/**
 * Interface cơ sở chứa toàn bộ các thuộc tính dùng chung của Form Section.
 */
export interface IBaseFormSection<TValues = unknown> {
    id?: string;
    title?: ReactNode;
    description?: ReactNode;
    icon?: string;
    badge?: ReactNode;
    badgeColor?: string;
    extra?: ReactNode;
    className?: string;
    gutter?: [number, number];
    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

export interface ICardFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type?: 'card';
    fields: IFormField<TValues>[];
}

export interface IPlainFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type: 'plain';
    fields: IFormField<TValues>[];
}

export interface ICollapseFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type: 'collapse';
    defaultCollapsed?: boolean;
    fields: IFormField<TValues>[];
}

export interface IFormTabItem<TValues = unknown> {
    key: string;
    label: ReactNode;
    icon?: string;
    badge?: ReactNode;
    badgeColor?: string;
    disabled?: boolean;
    gutter?: [number, number];
    fields: IFormField<TValues>[];
    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

export interface ITabsFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type: 'tabs';
    activeKey?: string;
    defaultActiveKey?: string;
    onChange?: (activeKey: string) => void;
    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
    items: IFormTabItem<TValues>[];
}

export type IFormSection<TValues = unknown> =
    | ICardFormSection<TValues>
    | IPlainFormSection<TValues>
    | ICollapseFormSection<TValues>
    | ITabsFormSection<TValues>;
```

### 2.2 AST Seams & Callers
- **`src/components/common/containers/form-modal-container/index.tsx`**:
  - Cập nhật `FormModalContainerProps`: loại bỏ `fields?: IFormField[]`, hỗ trợ `sections?: IFormSection<TValues>[]` và `children`.
  - Trong `content` memo: Render qua `CustomFormSection` khi có `sections?.length > 0`, hoặc fallback về `children`.
- **`src/components/common/forms/custom-form-field/index.tsx`**:
  - Mở rộng switch-case bên trong `renderFieldContent` để xử lý các input types mới: `date_picker`, `range_picker`, `upload`, `html_editor`, `code_editor`, `json_toggle`, `radio_group`, `checkbox_group`.
- **`src/components/common/forms/custom-form-section/`**:
  - `index.tsx`: Component điều phối duy nhất (`CustomFormSection`).
  - `SectionHeader.tsx`: Header nội bộ cho section với icon, badge, collapse toggle.
  - `CardFormSection.tsx`: Render nội bộ cho section dạng Card bọc viền.
  - `PlainFormSection.tsx`: Render nội bộ cho section phẳng không viền.
  - `CollapseFormSection.tsx`: Render nội bộ cho section có thể đóng/mở.
  - `TabsFormSection.tsx`: Render nội bộ cho section dạng Tabs nhiều trang.
- **`src/components/common/index.ts`**:
  - Barrel export `custom-form-section`.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/
├── interfaces/
│   └── [MODIFY] forms.ts                                              # Bổ sung IBaseFormSection, Polymorphic IFormSection & Extended IFormField
└── components/common/
    ├── [MODIFY] index.ts                                              # Barrel export custom-form-section
    ├── containers/form-modal-container/
    │   └── [MODIFY] index.tsx                                         # Hỗ trợ thuần sections?: IFormSection[] qua CustomFormSection
    └── forms/
        ├── [MODIFY] custom-form-field/
        │   └── [MODIFY] index.tsx                                     # Dispatch mở rộng các input types mới
        └── [NEW]    custom-form-section/
            ├── [NEW] SectionHeader.tsx                                # Header nội bộ cho section
            ├── [NEW] CardFormSection.tsx                              # Section dạng Card
            ├── [NEW] PlainFormSection.tsx                             # Section dạng Phẳng
            ├── [NEW] CollapseFormSection.tsx                          # Section dạng Thu gọn
            ├── [NEW] TabsFormSection.tsx                              # Section dạng Tabs
            └── [NEW] index.tsx                                        # Component điều phối duy nhất CustomFormSection
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/interfaces/forms.ts` | `IBaseFormSection`, `IFormSection`, `IFormField`, `FormFieldType` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/SectionHeader.tsx` | `SectionHeader`, `SectionHeaderProps` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/CardFormSection.tsx` | `CardFormSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/PlainFormSection.tsx` | `PlainFormSection` | `Order 1` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/CollapseFormSection.tsx` | `CollapseFormSection` | `Order 1, 2` | `npx tsc --noEmit` |
| **6** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/TabsFormSection.tsx` | `TabsFormSection` | `Order 1` | `npx tsc --noEmit` |
| **7** | `[x]` | `[NEW]` | `src/components/common/forms/custom-form-section/index.tsx` | `CustomFormSection`, `CustomFormSectionProps` | `Order 3-6` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/components/common/forms/custom-form-field/index.tsx` | `CustomFormField` switch-case extension | `Order 1` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/components/common/index.ts` | Export `custom-form-section` | `Order 7` | `npx tsc --noEmit` |
| **10** | `[x]` | `[MODIFY]` | `src/components/common/containers/form-modal-container/index.tsx` | `FormModalContainer` chuyển đổi hoàn toàn sang prop `sections` | `Order 7, 8` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)

### 1. `[MODIFY]` `src/interfaces/forms.ts`
> **Action**: Mở rộng `FormFieldType`, bổ sung các interface field type mới và định nghĩa `IBaseFormSection` cùng hệ thống Polymorphic `IFormSection`.

```diff
@@ line 10 @@
 } from '@/components/custom-antd';
+import type {
+    CustomPickerProps,
+    CustomRadioGroupProps,
+    CustomCheckboxProps,
+    UploadProps,
+    CustomTabsProps,
+} from '@/components/custom-antd';
+import type { ComponentProps } from 'react';
+import type { CustomPicker } from '@/components/custom-antd';
+import type { CustomCheckbox } from '@/components/custom-antd';
+import type { HtmlEditorProps } from '@/components/common/forms/html-editor';
 import type { FormMode } from '@/hooks';
 import type { FormRuleConfig } from '@/utilities';
 import type { ReactNode } from 'react';
 import type { IOption } from './component';

-export type FormFieldType =
-    'input' | 'number' | 'password' | 'textarea' | 'select' | 'switch' | 'custom';
+export type FormFieldType =
+    | 'input'
+    | 'number'
+    | 'password'
+    | 'textarea'
+    | 'select'
+    | 'switch'
+    | 'date_picker'
+    | 'range_picker'
+    | 'upload'
+    | 'html_editor'
+    | 'code_editor'
+    | 'json_toggle'
+    | 'radio_group'
+    | 'checkbox_group'
+    | 'custom';

@@ line 82 @@
 export interface ICustomFormField<TValues = unknown> extends IBaseFormField<TValues> {
     type: 'custom';
     render: (form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode;
 }
+
+export interface IDatePickerFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'date_picker';
+    placeholder?: string;
+    pickerProps?: CustomPickerProps;
+}
+
+export interface IRangePickerFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'range_picker';
+    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
+}
+
+export interface IUploadFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'upload';
+    uploadProps?: UploadProps;
+}
+
+export interface IHtmlEditorFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'html_editor';
+    placeholder?: string;
+    rows?: number;
+    editorProps?: Omit<HtmlEditorProps, 'value' | 'onChange' | 'placeholder' | 'rows' | 'disabled'>;
+}
+
+export interface ICodeEditorFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'code_editor';
+    language?: 'javascript' | 'json' | 'html';
+    maxHeight?: string;
+    isDisplayLanguage?: boolean;
+}
+
+export interface IJsonToggleFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'json_toggle';
+    icon?: string;
+    defaultEmptyValue?: string;
+    maxHeight?: string;
+}
+
+export interface IRadioGroupFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'radio_group';
+    options?: CustomRadioGroupProps['options'];
+    radioGroupProps?: CustomRadioGroupProps;
+}
+
+export interface ICheckboxGroupFormField<TValues = unknown> extends IBaseFormField<TValues> {
+    type: 'checkbox_group';
+    options?: CustomCheckboxProps[];
+    checkboxGroupProps?: ComponentProps<typeof CustomCheckbox.Group>;
+}

 export type IFormField<TValues = unknown> =
     | IInputFormField<TValues>
     | INumberFormField<TValues>
     | IPasswordFormField<TValues>
     | ITextAreaFormField<TValues>
     | ISelectFormField<TValues>
     | ISwitchFormField<TValues>
+    | IDatePickerFormField<TValues>
+    | IRangePickerFormField<TValues>
+    | IUploadFormField<TValues>
+    | IHtmlEditorFormField<TValues>
+    | ICodeEditorFormField<TValues>
+    | IJsonToggleFormField<TValues>
+    | IRadioGroupFormField<TValues>
+    | ICheckboxGroupFormField<TValues>
     | ICustomFormField<TValues>;
+
+export type FormSectionType = 'card' | 'plain' | 'collapse' | 'tabs';
+
+export interface IBaseFormSection<TValues = unknown> {
+    id?: string;
+    title?: ReactNode;
+    description?: ReactNode;
+    icon?: string;
+    badge?: ReactNode;
+    badgeColor?: string;
+    extra?: ReactNode;
+    className?: string;
+    gutter?: [number, number];
+    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+}
+
+export interface ICardFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
+    type?: 'card';
+    fields: IFormField<TValues>[];
+}
+
+export interface IPlainFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
+    type: 'plain';
+    fields: IFormField<TValues>[];
+}
+
+export interface ICollapseFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
+    type: 'collapse';
+    defaultCollapsed?: boolean;
+    fields: IFormField<TValues>[];
+}
+
+export interface IFormTabItem<TValues = unknown> {
+    key: string;
+    label: ReactNode;
+    icon?: string;
+    badge?: ReactNode;
+    badgeColor?: string;
+    disabled?: boolean;
+    gutter?: [number, number];
+    fields: IFormField<TValues>[];
+    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
+}
+
+export interface ITabsFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
+    type: 'tabs';
+    activeKey?: string;
+    defaultActiveKey?: string;
+    onChange?: (activeKey: string) => void;
+    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
+    items: IFormTabItem<TValues>[];
+}
+
+export type IFormSection<TValues = unknown> =
+    | ICardFormSection<TValues>
+    | IPlainFormSection<TValues>
+    | ICollapseFormSection<TValues>
+    | ITabsFormSection<TValues>;
```

---

### 2. `[NEW]` `src/components/common/forms/custom-form-section/SectionHeader.tsx`
> **Action**: Tạo component `SectionHeader` hiển thị icon, tiêu đề, mô tả, badge, nút phụ trợ và toggle expand/collapse (internal).

```typescript
'use client';

import { CustomButton, CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';

export type SectionHeaderProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: string;
    badge?: ReactNode;
    badgeColor?: string;
    extra?: ReactNode;
    className?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
};

export const SectionHeader = ({
    title,
    description,
    icon,
    badge,
    badgeColor = 'blue',
    extra,
    className = '',
    collapsible = false,
    collapsed = false,
    onToggleCollapse,
}: SectionHeaderProps) => {
    return (
        <CustomFlex
            wrap="wrap"
            gap="small"
            align="center"
            justify="space-between"
            className={`w-full ${className}`}
        >
            <CustomFlex align="center" gap="middle" className="min-w-0">
                {icon && (
                    <div className="w-8 h-8 rounded-lg bg-hub-primary/10 text-hub-primary border border-hub-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                        <Icon icon={icon} className="text-base" />
                    </div>
                )}
                <CustomFlex vertical gap={2} className="min-w-0">
                    <CustomTypography.Text
                        strong
                        className="text-sm sm:text-base text-hub-title font-semibold tracking-tight"
                    >
                        {title}
                    </CustomTypography.Text>
                    {description && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                            {description}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
            </CustomFlex>

            <CustomFlex align="center" gap="small" className="shrink-0">
                {badge && (
                    <CustomTag
                        color={badgeColor}
                        className="m-0 text-xs font-medium rounded-md px-2 py-0.5"
                    >
                        {badge}
                    </CustomTag>
                )}
                {extra}
                {collapsible && (
                    <CustomButton
                        type="text"
                        size="small"
                        onClick={onToggleCollapse}
                        className="text-hub-muted hover:text-hub-title p-1"
                        icon={
                            <Icon
                                icon="lucide:chevron-down"
                                className={`text-base transition-transform duration-200 ${
                                    collapsed ? '-rotate-90' : 'rotate-0'
                                }`}
                            />
                        }
                    />
                )}
            </CustomFlex>
        </CustomFlex>
    );
};
```

---

### 3. `[NEW]` `src/components/common/forms/custom-form-section/CardFormSection.tsx`
> **Action**: Tạo component `CardFormSection` render section dạng Card bọc viền (internal).

```typescript
'use client';

import { CustomFlex, CustomRow, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { ICardFormSection } from '@/interfaces';
import { CustomFormField } from '../custom-form-field';
import { SectionHeader } from './SectionHeader';

export type CardFormSectionProps<TValues extends object = Record<string, unknown>> = {
    section: ICardFormSection<TValues>;
    form?: FormInstance<TValues>;
    mode: FormMode;
};

export const CardFormSection = <TValues extends object = Record<string, unknown>>({
    section,
    form,
    mode,
}: CardFormSectionProps<TValues>) => {
    const {
        title,
        description,
        icon,
        badge,
        badgeColor,
        extra,
        className = '',
        gutter = [16, 0],
        fields,
    } = section;

    if (!fields?.length) return null;

    const hasHeader = Boolean(title || description || icon || badge || extra);

    return (
        <CustomFlex
            vertical
            gap={12}
            className={`w-full p-4 rounded-xl border border-hub-border/60 bg-hub-card/40 mb-4 transition-all ${className}`.trim()}
        >
            {hasHeader && (
                <SectionHeader
                    title={title}
                    description={description}
                    icon={icon}
                    badge={badge}
                    badgeColor={badgeColor}
                    extra={extra}
                />
            )}

            <CustomRow gutter={gutter} className="w-full">
                {fields.map((field) => (
                    <CustomFormField
                        key={String(field.name)}
                        field={field}
                        form={form}
                        mode={mode}
                    />
                ))}
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 4. `[NEW]` `src/components/common/forms/custom-form-section/PlainFormSection.tsx`
> **Action**: Tạo component `PlainFormSection` render section phẳng tối giản (internal).

```typescript
'use client';

import { CustomFlex, CustomRow, CustomTypography, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { IPlainFormSection } from '@/interfaces';
import { CustomFormField } from '../custom-form-field';

export type PlainFormSectionProps<TValues extends object = Record<string, unknown>> = {
    section: IPlainFormSection<TValues>;
    form?: FormInstance<TValues>;
    mode: FormMode;
};

export const PlainFormSection = <TValues extends object = Record<string, unknown>>({
    section,
    form,
    mode,
}: PlainFormSectionProps<TValues>) => {
    const { title, description, className = '', gutter = [16, 0], fields } = section;

    if (!fields?.length) return null;

    return (
        <CustomFlex vertical gap={8} className={`w-full mb-4 ${className}`.trim()}>
            {title && (
                <CustomFlex vertical gap={2}>
                    <CustomTypography.Text strong className="text-sm font-semibold text-hub-title">
                        {title}
                    </CustomTypography.Text>
                    {description && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle">
                            {description}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
            )}

            <CustomRow gutter={gutter} className="w-full">
                {fields.map((field) => (
                    <CustomFormField
                        key={String(field.name)}
                        field={field}
                        form={form}
                        mode={mode}
                    />
                ))}
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 5. `[NEW]` `src/components/common/forms/custom-form-section/CollapseFormSection.tsx`
> **Action**: Tạo component `CollapseFormSection` render section có thể đóng/mở (internal).

```typescript
'use client';

import { CustomFlex, CustomRow, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { ICollapseFormSection } from '@/interfaces';
import { useState } from 'react';
import { CustomFormField } from '../custom-form-field';
import { SectionHeader } from './SectionHeader';

export type CollapseFormSectionProps<TValues extends object = Record<string, unknown>> = {
    section: ICollapseFormSection<TValues>;
    form?: FormInstance<TValues>;
    mode: FormMode;
};

export const CollapseFormSection = <TValues extends object = Record<string, unknown>>({
    section,
    form,
    mode,
}: CollapseFormSectionProps<TValues>) => {
    const {
        title,
        description,
        icon,
        badge,
        badgeColor,
        extra,
        className = '',
        gutter = [16, 0],
        defaultCollapsed = false,
        fields,
    } = section;

    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    if (!fields?.length) return null;

    return (
        <CustomFlex
            vertical
            gap={12}
            className={`w-full p-4 rounded-xl border border-hub-border/60 bg-hub-card/40 mb-4 transition-all ${className}`.trim()}
        >
            <SectionHeader
                title={title}
                description={description}
                icon={icon}
                badge={badge}
                badgeColor={badgeColor}
                extra={extra}
                collapsible
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />

            {!collapsed && (
                <CustomRow gutter={gutter} className="w-full">
                    {fields.map((field) => (
                        <CustomFormField
                            key={String(field.name)}
                            field={field}
                            form={form}
                            mode={mode}
                        />
                    ))}
                </CustomRow>
            )}
        </CustomFlex>
    );
};
```

---

### 6. `[NEW]` `src/components/common/forms/custom-form-section/TabsFormSection.tsx`
> **Action**: Tạo component `TabsFormSection` render cụm Tabs tích hợp Form fields với `destroyInactiveTabPane={false}` và `forceRender={true}` (internal).

```typescript
'use client';

import { CustomFlex, CustomRow, CustomTabs, CustomTag, type FormInstance } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { FormMode } from '@/hooks';
import type { ITabsFormSection } from '@/interfaces';
import { useMemo } from 'react';
import { CustomFormField } from '../custom-form-field';

export type TabsFormSectionProps<TValues extends object = Record<string, unknown>> = {
    section: ITabsFormSection<TValues>;
    form?: FormInstance<TValues>;
    mode: FormMode;
};

export const TabsFormSection = <TValues extends object = Record<string, unknown>>({
    section,
    form,
    mode,
}: TabsFormSectionProps<TValues>) => {
    const {
        activeKey,
        defaultActiveKey,
        onChange,
        tabsProps,
        items,
        className = '',
    } = section;

    const tabItems = useMemo(() => {
        return items
            .filter((item) => {
                if (typeof item.visible === 'function') {
                    return item.visible(mode, form);
                }
                return item.visible !== false;
            })
            .map((item) => {
                const labelNode = (
                    <CustomFlex align="center" gap={6}>
                        {item.icon && <Icon icon={item.icon} className="text-base" />}
                        <span>{item.label}</span>
                        {item.badge && (
                            <CustomTag
                                color={item.badgeColor || 'blue'}
                                className="m-0 text-xs px-1.5 py-0 rounded-md"
                            >
                                {item.badge}
                            </CustomTag>
                        )}
                    </CustomFlex>
                );

                return {
                    key: item.key,
                    label: labelNode,
                    disabled: item.disabled,
                    forceRender: true,
                    children: (
                        <div className="pt-2">
                            <CustomRow gutter={item.gutter || [16, 0]} className="w-full">
                                {item.fields.map((field) => (
                                    <CustomFormField
                                        key={String(field.name)}
                                        field={field}
                                        form={form}
                                        mode={mode}
                                    />
                                ))}
                            </CustomRow>
                        </div>
                    ),
                };
            });
    }, [items, form, mode]);

    if (!tabItems.length) return null;

    return (
        <div className={`w-full mb-4 ${className}`.trim()}>
            <CustomTabs
                destroyInactiveTabPane={false}
                activeKey={activeKey}
                defaultActiveKey={defaultActiveKey || items[0]?.key}
                onChange={onChange}
                items={tabItems}
                {...tabsProps}
            />
        </div>
    );
};
```

---

### 7. `[NEW]` `src/components/common/forms/custom-form-section/index.tsx`
> **Action**: Component điều phối duy nhất `CustomFormSection` nhận `sections: IFormSection[]`, quản lý visibility và render các section tương ứng.

```typescript
'use client';

import { CustomFlex, type FormInstance } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type { IFormSection } from '@/interfaces';
import { CardFormSection } from './CardFormSection';
import { CollapseFormSection } from './CollapseFormSection';
import { PlainFormSection } from './PlainFormSection';
import { TabsFormSection } from './TabsFormSection';

export type CustomFormSectionProps<TValues extends object = Record<string, unknown>> = {
    sections?: IFormSection<TValues>[];
    form?: FormInstance<TValues>;
    mode: FormMode;
    className?: string;
};

export const CustomFormSection = <TValues extends object = Record<string, unknown>>({
    sections,
    form,
    mode,
    className = '',
}: CustomFormSectionProps<TValues>) => {
    if (!sections || sections.length === 0) {
        return null;
    }

    return (
        <CustomFlex vertical className={`w-full ${className}`.trim()}>
            {sections.map((section, index) => {
                if (typeof section.visible === 'function' && !section.visible(mode, form)) {
                    return null;
                }
                if (section.visible === false) {
                    return null;
                }

                const sectionKey = section.id || `section-${index}`;
                const type = section.type || 'card';

                switch (type) {
                    case 'plain':
                        return (
                            <PlainFormSection
                                key={sectionKey}
                                section={section}
                                form={form}
                                mode={mode}
                            />
                        );
                    case 'collapse':
                        return (
                            <CollapseFormSection
                                key={sectionKey}
                                section={section}
                                form={form}
                                mode={mode}
                            />
                        );
                    case 'tabs':
                        return (
                            <TabsFormSection
                                key={sectionKey}
                                section={section}
                                form={form}
                                mode={mode}
                            />
                        );
                    case 'card':
                    default:
                        return (
                            <CardFormSection
                                key={sectionKey}
                                section={section}
                                form={form}
                                mode={mode}
                            />
                        );
                }
            })}
        </CustomFlex>
    );
};
```

---

### 8. `[MODIFY]` `src/components/common/forms/custom-form-field/index.tsx`
> **Action**: Tích hợp các input widgets mới (`range_picker`, `date_picker`, `upload`, `html_editor`, `code_editor`, `json_toggle`, `radio_group`, `checkbox_group`) vào `CustomFormField`.

```diff
@@ line 1 @@
 'use client';

 import {
+    CodeDisplay,
     CustomInputForm,
     CustomInputFormType,
+    CustomRangePicker,
     CustomSelectInput,
     CustomSwitchForm,
+    CustomUpload,
+    HtmlEditor,
 } from '@/components/common';
 import type { FormInstance } from '@/components/custom-antd';
-import { CustomCol } from '@/components/custom-antd';
+import {
+    CustomCheckbox,
+    CustomCol,
+    CustomFlex,
+    CustomForm,
+    CustomPicker,
+    CustomRadio,
+    CustomSwitch,
+    CustomTypography,
+} from '@/components/custom-antd';
+import { Icon } from '@iconify/react';
+import { buildFormRules } from '@/utilities';
+import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
 import type { FormMode } from '@/hooks';
 import type {
+    ICheckboxGroupFormField,
+    ICodeEditorFormField,
     ICustomFormField,
+    IDatePickerFormField,
     IFormField,
     IHtmlEditorFormField,
     IInputFormField,
+    IJsonToggleFormField,
     INumberFormField,
     IPasswordFormField,
+    IRadioGroupFormField,
     IRangePickerFormField,
     ISelectFormField,
     ISwitchFormField,
     ITextAreaFormField,
+    IUploadFormField,
 } from '@/interfaces';

@@ line 175 @@
+            case 'range_picker': {
+                const rangePickerField = field as IRangePickerFormField<TValues>;
+                return (
+                    <CustomRangePicker
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        rangePickerProps={{
+                            disabled: isDisabled,
+                            ...rangePickerField.rangePickerProps,
+                        }}
+                    />
+                );
+            }
+            case 'date_picker': {
+                const datePickerField = field as IDatePickerFormField<TValues>;
+                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
+                return (
+                    <CustomForm.Item
+                        {...formItemProps}
+                        name={name}
+                        label={label}
+                        rules={formRules}
+                    >
+                        <CustomPicker
+                            disabled={isDisabled}
+                            placeholder={datePickerField.placeholder}
+                            className="w-full"
+                            {...datePickerField.pickerProps}
+                        />
+                    </CustomForm.Item>
+                );
+            }
+            case 'upload': {
+                const uploadField = field as IUploadFormField<TValues>;
+                return (
+                    <CustomUpload
+                        name={name}
+                        label={label}
+                        rulesConfig={rulesConfig}
+                        formItemProps={formItemProps}
+                        uploadProps={{
+                            disabled: isDisabled,
+                            ...uploadField.uploadProps,
+                        }}
+                    />
+                );
+            }
+            case 'html_editor': {
+                const htmlField = field as IHtmlEditorFormField<TValues>;
+                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
+                return (
+                    <CustomForm.Item
+                        {...formItemProps}
+                        name={name}
+                        label={label}
+                        rules={formRules}
+                    >
+                        <HtmlEditor
+                            disabled={isDisabled}
+                            placeholder={htmlField.placeholder}
+                            rows={htmlField.rows}
+                            {...htmlField.editorProps}
+                        />
+                    </CustomForm.Item>
+                );
+            }
+            case 'code_editor': {
+                const codeField = field as ICodeEditorFormField<TValues>;
+                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
+                return (
+                    <CustomForm.Item
+                        {...formItemProps}
+                        name={name}
+                        label={label}
+                        rules={formRules}
+                    >
+                        <CodeDisplay
+                            code={form?.getFieldValue(name as any) ?? ''}
+                            language={codeField.language}
+                            maxHeight={codeField.maxHeight}
+                            isDisplayLanguage={codeField.isDisplayLanguage ?? true}
+                            onCodeChange={
+                                !isDisabled
+                                    ? (newCode: string) => form?.setFieldValue(name as any, newCode)
+                                    : undefined
+                            }
+                        />
+                    </CustomForm.Item>
+                );
+            }
+            case 'radio_group': {
+                const radioField = field as IRadioGroupFormField<TValues>;
+                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
+                return (
+                    <CustomForm.Item
+                        {...formItemProps}
+                        name={name}
+                        label={label}
+                        rules={formRules}
+                    >
+                        <CustomRadio.Group
+                            disabled={isDisabled}
+                            options={radioField.options}
+                            {...radioField.radioGroupProps}
+                        />
+                    </CustomForm.Item>
+                );
+            }
+            case 'checkbox_group': {
+                const checkboxField = field as ICheckboxGroupFormField<TValues>;
+                const formRules = buildFormRules({ rules: rulesConfig ?? [] });
+                return (
+                    <CustomForm.Item
+                        {...formItemProps}
+                        name={name}
+                        label={label}
+                        rules={formRules}
+                    >
+                        <CustomCheckbox.Group
+                            disabled={isDisabled}
+                            options={checkboxField.options}
+                            {...checkboxField.checkboxGroupProps}
+                        />
+                    </CustomForm.Item>
+                );
+            }
             case 'input':
             default: {
```

---

### 9. `[MODIFY]` `src/components/common/index.ts`
> **Action**: Export `custom-form-section` từ `src/components/common/index.ts`.

```diff
@@ line 30 @@
 export * from './forms/custom-form-field';
 export * from './forms/custom-form-list';
+export * from './forms/custom-form-section';
 export * from './forms/custom-input-form';
```

---

### 10. `[MODIFY]` `src/components/common/containers/form-modal-container/index.tsx`
> **Action**: Thay thế `fields` bằng `sections?: IFormSection<TValues>[]` trong `FormModalContainerProps` và bọc qua `CustomFormSection`.

```diff
@@ line 3 @@
-import { CustomFormField, CustomModalForm } from '@/components/common';
-import { CustomRow, type FormInstance } from '@/components/custom-antd';
+import { CustomFormSection, CustomModalForm } from '@/components/common';
+import { type FormInstance } from '@/components/custom-antd';
 import type { FormMode, UseCustomModalFormResponse } from '@/hooks';
-import type { IFormField } from '@/interfaces';
+import type { IFormSection } from '@/interfaces';
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
-    fields?: IFormField<TValues>[];
+    sections?: IFormSection<TValues>[];
     children?: ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
 };

@@ line 43 @@
     createInitialValues = {} as TValues,
-    fields,
+    sections,
     children,
 }: FormModalContainerProps<TQueryFnData, TValues, TData>) => {
     const { mode, formProps } = modalForm;

     const content = useMemo(() => {
-        if (fields?.length) {
-            return (
-                <CustomRow gutter={[16, 0]}>
-                    {fields.map((field) => (
-                        <CustomFormField
-                            mode={mode}
-                            field={field}
-                            form={formProps.form}
-                            key={String(field.name)}
-                        />
-                    ))}
-                </CustomRow>
-            );
-        }
+        if (sections?.length) {
+            return (
+                <CustomFormSection
+                    sections={sections}
+                    form={formProps.form}
+                    mode={mode}
+                />
+            );
+        }

         if (typeof children === 'function') {
             return children(formProps.form, mode);
         }

         return children;
-    }, [fields, children, formProps.form, mode]);
+    }, [sections, children, formProps.form, mode]);
```

---

## Section 5. Test Cases & Verification

- **Automated Verification**:
  - `npx tsc --noEmit` -> **PASS**: Typecheck passed with 0 errors across the entire repository.
  - `npm run lint:fix` -> **PASS**: ESLint and Prettier passed with 0 errors and 0 warnings.
- **Manual Verification Steps**:
  1. Kiểm tra `FormModalContainer` với các section:
     - Section 1 (`type: 'tabs'`): Chuyển đổi giữa các tab, kiểm tra dữ liệu tab ẩn vẫn được gửi khi submit.
     - Section 2 (`type: 'card'`): Card bọc viền với icon, badge.
     - Section 3 (`type: 'collapse'`): Đóng/mở mượt mà.
     - Section 4: Thử nghiệm các input widgets mới (`range_picker`, `upload`, `html_editor`, `radio_group`, `checkbox_group`).
