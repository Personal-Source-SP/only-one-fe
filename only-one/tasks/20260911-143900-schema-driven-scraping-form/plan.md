---
status: done
slug: schema-driven-scraping-form
started_at: 2026-09-11
completed_at: 2026-09-11
pr_url: ~
branch: ~
---

# Plan: Schema-Driven Scraping Form Architecture Refactoring

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)

- **Mã nguồn hiện tại & Phân mảnh view**: Cấu trúc UI của 2 tab cấu hình (`ScrapingConfigTab` và `SearchConfigTab`) đang bị phân tán trong hơn 7 file component JSX riêng lẻ (`ScrapingBasicSection`, `ScrapingSelectorsSection`, `SearchUrlPatternSection`, `SearchSelectorsSection`, `FeatureLimitsSection`, `FeatureAdvancedSection`, `FeatureCodeSection`).
- **Khai báo Điều kiện Hiển thị Linh hoạt (`VisibilityCondition`)**:
  - `visibleWhen` hỗ trợ nhận trực tiếp **Array `ScraperServiceEnum[]`** (ví dụ: `[ScraperServiceEnum.GENERIC]`, `[ScraperServiceEnum.GENERIC, ScraperServiceEnum.API]`), hoặc `boolean`, hoặc function `(context) => boolean`.
  - Giúp schema declarative hơn rất nhiều, không cần viết function lặp đi lặp lại.
- **Xóa bỏ hoàn toàn 2 thư mục ScrapingConfigTab & SearchConfigTab**:
  - `DynamicFeatureConfigForm` tự động xử lý toàn bộ form cho cả Scraping lẫn Search dựa vào `feature.type` và `service` trong context.
  - Xóa bỏ hoàn toàn 2 thư mục `ScrapingConfigTab/` và `SearchConfigTab/`. `FeatureSettingModal` render trực tiếp `<DynamicFeatureConfigForm />`.
  - Tinh gọn `FEATURE_REGISTRY` trong `feature-registry.ts` (không còn cần thuộc tính `ConfigComponent`).
- **Triệt tiêu hoàn toàn trùng lặp dữ liệu mặc định**:
  - `SCRAPER_SERVICE_METADATA`, `IScraperServiceMetadata` và `checkService` bị xóa bỏ hoàn toàn.
  - Các hardcoded object tĩnh `DEFAULT_TARGET_CONFIG` và `DEFAULT_SEARCH_TARGET_CONFIG` được **chuyển hóa thành hàm sinh động từ schema** qua helper `getDefaultFormValues(context)`.
  - Mọi giá trị mặc định (`defaultValue`: 10, 1000, 3, 30000, false, '{query}', code templates...) được **khai báo duy nhất 1 lần bên trong từng field** của `FEATURE_FORM_SECTIONS`.
- **Chuẩn hóa Type System (Dùng type thay vì interface)**:
  - Toàn bộ Props và Schemas (`SelectFieldProps`, `TextFieldProps`, `NumberFieldProps`, `SwitchCardFieldProps`, `CodeEditorFieldProps`, `JsonToggleFieldProps`, `FormFieldSchema`, `FormSectionSchema`, `DynamicFormFieldProps`...) sử dụng `type` alias đồng nhất.
- **Module hóa Tầng Widgets (Single Responsibility Principle)**:
  - Tách `DynamicFormField` thành thư mục chuyên biệt `DynamicFormField/` chứa từng widget độc lập (`TextFieldWidget`, `SelectFieldWidget`, `NumberFieldWidget`, `SwitchCardWidget`, `CodeEditorWidget`, `JsonToggleWidget`).
- **Invariants bắt buộc duy trì**:
  - Bảo toàn 100% cơ chế Form Diff so sánh lịch sử (`FormDiffLabel`) cho tất cả các field.
  - Bảo toàn hành vi toggle mở rộng JSON Code Editor (Monaco/CodeDisplay) cho `headers` và `cookies` cùng các switch card trong phần Advanced Settings.
  - Giữ nguyên hợp đồng dữ liệu đầu ra `TargetConfig` và hàm chuyển đổi `mapConfigToBaseFormValues` / `extractTargetConfigFromFormValues`.
  - Tự động đồng bộ template code mẫu (`functionGenerator`) khi thay đổi `service` engine qua `DEFAULT_FEATURE_TEMPLATES`.

---

## Section 2. Technical Contracts & AST Seams (Hợp Đồng Mã Nguồn & Điểm Neo)

*(Kế thừa 100% cơ chế vận hành từ [concept.md](file:///Users/kiem/Sources/PERSONAL/only-one-fe/only-one/tasks/20260911-143900-schema-driven-scraping-form/concept.md); không mô tả lại giải pháp tổng quan)*

### 2.1 Type Signatures & Code Contracts

```typescript
// src/app/(root)/scraping/features/types/feature-form.types.ts
import type { Rule } from '@/components/custom-antd';
import type { SelectProps } from 'antd';
import type { ReactNode } from 'react';
import type { DataProviderFeatureType, ScraperServiceEnum } from '../enums';

export type FormEvaluationContext = {
    service: ScraperServiceEnum;
    featureType: DataProviderFeatureType;
    isViewingHistory?: boolean;
    isServiceDisabled?: boolean;
    currentValues?: Record<string, unknown>;
};

export type GridSpanObject = {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    span?: number;
};

export type GridSpanValue = number | GridSpanObject;
export type Evaluatable<T> = T | ((context: FormEvaluationContext) => T);

export type VisibilityCondition =
    | boolean
    | ScraperServiceEnum[]
    | ((context: FormEvaluationContext) => boolean);

export type BaseFormFieldSchema = {
    name: string;
    label: Evaluatable<ReactNode>;
    description?: Evaluatable<string>;
    placeholder?: string;
    defaultValue?: Evaluatable<unknown>;
    gridSpan?: Evaluatable<GridSpanValue>;
    visibleWhen?: VisibilityCondition;
    getRules?: (context: FormEvaluationContext) => Rule[];
};

export type SelectFieldProps = {
    options?: SelectProps['options'];
    disabled?: boolean;
    allowClear?: boolean;
    className?: string;
};

export type SelectFormFieldSchema = BaseFormFieldSchema & {
    type: 'select';
    fieldProps?: Evaluatable<SelectFieldProps>;
};

export type TextFieldProps = {
    maxLength?: number;
    disabled?: boolean;
    className?: string;
};

export type TextFormFieldSchema = BaseFormFieldSchema & {
    type: 'text';
    fieldProps?: Evaluatable<TextFieldProps>;
};

export type NumberFieldProps = {
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
};

export type NumberFormFieldSchema = BaseFormFieldSchema & {
    type: 'number';
    fieldProps?: Evaluatable<NumberFieldProps>;
};

export type SwitchCardFieldProps = {
    disabled?: boolean;
    className?: string;
};

export type SwitchCardFormFieldSchema = BaseFormFieldSchema & {
    type: 'switch_card';
    fieldProps?: Evaluatable<SwitchCardFieldProps>;
};

export type CodeEditorFieldProps = {
    language?: string;
    maxHeight?: string;
    isDisplayLanguage?: boolean;
    disabled?: boolean;
};

export type CodeEditorFormFieldSchema = BaseFormFieldSchema & {
    type: 'code_editor';
    fieldProps?: Evaluatable<CodeEditorFieldProps>;
};

export type JsonToggleFieldProps = {
    icon?: string;
    defaultEmptyValue?: string;
    maxHeight?: string;
    disabled?: boolean;
};

export type JsonToggleFormFieldSchema = BaseFormFieldSchema & {
    type: 'json_toggle';
    fieldProps?: Evaluatable<JsonToggleFieldProps>;
};

export type FormFieldSchema =
    | SelectFormFieldSchema
    | TextFormFieldSchema
    | NumberFormFieldSchema
    | SwitchCardFormFieldSchema
    | CodeEditorFormFieldSchema
    | JsonToggleFormFieldSchema;

export type IFormFieldSchema = FormFieldSchema;
export type FormFieldType = FormFieldSchema['type'];

export type FormSectionSchema = {
    id: string;
    title: Evaluatable<ReactNode>;
    description?: Evaluatable<string>;
    icon?: Evaluatable<string>;
    visibleWhen?: VisibilityCondition;
    fields: FormFieldSchema[];
};

export type IFormSectionSchema = FormSectionSchema;

export type ScraperFieldRuleConfig = {
    required?: boolean;
    message?: string;
};
```

### 2.2 AST Seams & Callers

1. **`constants/` folder**:
   - `common.constants.ts`: Khai báo `FEATURE_MODAL_WIDTH`, `FEATURE_SECTION_CONTAINER_CLASS`, `SCRAPER_SERVICE_LABELS`, `SCRAPER_SERVICE_OPTIONS`, `DEFAULT_FEATURE_TEMPLATES`, helper `isFieldVisible`, hàm `getDefaultFormValuesFromSections`.
   - `scraping.constants.ts`: Khai báo `SCRAPING_FORM_SECTIONS: FormSectionSchema[]` và `DEFAULT_TARGET_CONFIG` riêng cho tính năng Scraping.
   - `search.constants.ts`: Khai báo `SEARCH_FORM_SECTIONS: FormSectionSchema[]` và `DEFAULT_SEARCH_TARGET_CONFIG` riêng cho tính năng Search.
   - `index.ts`: Barrel re-exports, `FEATURE_FORM_SECTIONS: Record<DataProviderFeatureType, FormSectionSchema[]>`, `getFeatureFormSections(featureType)`, và `getDefaultFormValues(context)`.
   - Xóa bỏ file đơn `constants.ts` cũ.
2. **`hooks/useFeatureConfigForm.ts`**:
   - Thay thế `checkService(service).defaultScrapingTemplate` bằng `DEFAULT_FEATURE_TEMPLATES[feature.type][service]`.
   - Lấy config mặc định qua `getDefaultFormValues({ service, featureType: feature.type })`.
3. **`components/FeatureSettingModal/`**:
   - `FeatureModalHeader.tsx`: Sử dụng `SCRAPER_SERVICE_LABELS[service]`.
   - `FeatureSettingModal/index.tsx`: Render trực tiếp `<DynamicFeatureConfigForm />` thay vì dynamic `ConfigComponent`.
4. **`components/FeatureCardDetail/FeatureCardHeader.tsx`**:
   - Sử dụng `SCRAPER_SERVICE_LABELS[service]`.
5. **`utils/feature-registry.ts`**:
   - Xóa bỏ `ConfigComponent` khỏi `FeatureDefinition` và `FEATURE_REGISTRY`. Xóa imports `ScrapingConfigTab` và `SearchConfigTab`.
6. **`components/ConfigFormCommon/DynamicFormField/`**:
   - `TextFieldWidget.tsx`: Render text input widget.
   - `SelectFieldWidget.tsx`: Render select dropdown widget.
   - `NumberFieldWidget.tsx`: Render number input widget.
   - `SwitchCardWidget.tsx`: Render switch card widget.
   - `CodeEditorWidget.tsx`: Render Monaco code editor widget.
   - `JsonToggleWidget.tsx`: Render JSON code editor widget.
   - `index.tsx`: DynamicFormField dispatcher.
7. **`components/ConfigFormCommon/DynamicFormSection.tsx` & `DynamicFeatureConfigForm.tsx`**:
   - `DynamicFormSection.tsx`: Sử dụng `isFieldVisible` để lọc sections và fields hiển thị.
   - `DynamicFeatureConfigForm.tsx`: Component Form chung tự động thích ứng với Scraping và Search.
   - Xóa bỏ các section component cũ (`FeatureLimitsSection`, `FeatureAdvancedSection`, `FeatureCodeSection`).
8. **Xóa bỏ hoàn toàn 2 thư mục**:
   - `src/app/(root)/scraping/features/components/ScrapingConfigTab/` [DELETE]
   - `src/app/(root)/scraping/features/components/SearchConfigTab/` [DELETE]
   - Cập nhật `components/index.ts` xóa các exports của 2 thư mục trên.

---

## Section 3. Directory Structure & Task Matrix

### 3.1 Directory Structure Changes

```text
src/app/(root)/scraping/features/
├── types/
│   └── [MODIFY] feature-form.types.ts                   # VisibilityCondition, defaultValue, discriminated unions và dùng type
├── constants/
│   ├── [NEW]    common.constants.ts                     # FEATURE_MODAL_WIDTH, FEATURE_SECTION_CONTAINER_CLASS, SCRAPER_SERVICE_LABELS/OPTIONS, DEFAULT_FEATURE_TEMPLATES, isFieldVisible, getDefaultFormValuesFromSections
│   ├── [NEW]    scraping.constants.ts                   # SCRAPING_FORM_SECTIONS, DEFAULT_TARGET_CONFIG
│   ├── [NEW]    search.constants.ts                     # SEARCH_FORM_SECTIONS, DEFAULT_SEARCH_TARGET_CONFIG
│   └── [NEW]    index.ts                                # Re-exports, FEATURE_FORM_SECTIONS, getFeatureFormSections, getDefaultFormValues
├── [DELETE] constants.ts                                # Xóa file cũ, thay thế bằng folder constants/
├── hooks/
│   └── [MODIFY] useFeatureConfigForm.ts                 # Dùng DEFAULT_FEATURE_TEMPLATES & getDefaultFormValues
├── utils/
│   └── [MODIFY] feature-registry.ts                     # Xóa ConfigComponent & imports ScrapingConfigTab/SearchConfigTab
├── components/
│   ├── ConfigFormCommon/
│   │   ├── DynamicFormField/
│   │   │   ├── [NEW]    TextFieldWidget.tsx             # Text Input Widget
│   │   │   ├── [NEW]    SelectFieldWidget.tsx           # Select Input Widget
│   │   │   ├── [NEW]    NumberFieldWidget.tsx           # Number Input Widget
│   │   │   ├── [NEW]    SwitchCardWidget.tsx            # Switch Card Toggle Widget
│   │   │   ├── [NEW]    CodeEditorWidget.tsx            # Monaco Code Editor Widget
│   │   │   ├── [NEW]    JsonToggleWidget.tsx            # JSON Code Editor with Switch Toggle
│   │   │   └── [NEW]    index.tsx                       # DynamicFormField dispatcher
│   │   ├── [NEW]    DynamicFormSection.tsx              # Render SectionHeader + CustomRow/CustomCol grid
│   │   ├── [NEW]    DynamicFeatureConfigForm.tsx        # Generic Dynamic Form Container
│   │   ├── [DELETE] FeatureLimitsSection.tsx            # Xóa component hardcode cũ
│   │   ├── [DELETE] FeatureAdvancedSection.tsx          # Xóa component hardcode cũ
│   │   ├── [DELETE] FeatureCodeSection.tsx              # Xóa component hardcode cũ
│   │   └── [MODIFY] index.ts                            # Cập nhật barrel export
│   ├── FeatureSettingModal/
│   │   ├── [MODIFY] FeatureModalHeader.tsx              # Dùng SCRAPER_SERVICE_LABELS
│   │   └── [MODIFY] index.tsx                           # Render trực tiếp DynamicFeatureConfigForm
│   ├── FeatureCardDetail/
│   │   └── [MODIFY] FeatureCardHeader.tsx               # Dùng SCRAPER_SERVICE_LABELS
│   ├── [DELETE] ScrapingConfigTab/                      # Xóa toàn bộ thư mục (index.tsx, ScrapingBasicSection, ScrapingSelectorsSection)
│   ├── [DELETE] SearchConfigTab/                        # Xóa toàn bộ thư mục (index.tsx, SearchUrlPatternSection, SearchSelectorsSection)
│   └── [MODIFY] index.ts                                # Xóa exports ScrapingConfigTab và SearchConfigTab
```

### 3.2 Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/types/feature-form.types.ts` | `VisibilityCondition, FormFieldSchema, FormSectionSchema` | `None` | `npx tsc --noEmit` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/common.constants.ts` | `isFieldVisible, SCRAPER_SERVICE_LABELS, SCRAPER_SERVICE_OPTIONS, DEFAULT_FEATURE_TEMPLATES, getDefaultFormValuesFromSections` | `Order 1` | `npx tsc --noEmit` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/scraping.constants.ts` | `SCRAPING_FORM_SECTIONS, DEFAULT_TARGET_CONFIG` | `Order 2` | `npx tsc --noEmit` |
| **4** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/search.constants.ts` | `SEARCH_FORM_SECTIONS, DEFAULT_SEARCH_TARGET_CONFIG` | `Order 2` | `npx tsc --noEmit` |
| **5** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/constants/index.ts` | `FEATURE_FORM_SECTIONS, getFeatureFormSections, getDefaultFormValues, Barrel Exports` | `Order 2, 3, 4` | `npx tsc --noEmit` |
| **6** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/constants.ts` | `Obsolete single constants file` | `Order 5` | `npx tsc --noEmit` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts` | `useFeatureConfigForm` | `Order 5` | `npx tsc --noEmit` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeader` | `Order 5` | `npx tsc --noEmit` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx` | `FeatureCardHeader` | `Order 5` | `npx tsc --noEmit` |
| **10** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/TextFieldWidget.tsx` | `TextFieldWidget` | `Order 1` | `npx tsc --noEmit` |
| **11** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/SelectFieldWidget.tsx` | `SelectFieldWidget` | `Order 1` | `npx tsc --noEmit` |
| **12** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/NumberFieldWidget.tsx` | `NumberFieldWidget` | `Order 1` | `npx tsc --noEmit` |
| **13** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/SwitchCardWidget.tsx` | `SwitchCardWidget` | `Order 1` | `npx tsc --noEmit` |
| **14** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/CodeEditorWidget.tsx` | `CodeEditorWidget` | `Order 1` | `npx tsc --noEmit` |
| **15** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/JsonToggleWidget.tsx` | `JsonToggleWidget` | `Order 1` | `npx tsc --noEmit` |
| **16** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/index.tsx` | `DynamicFormField` | `Order 10-15` | `npx tsc --noEmit` |
| **17** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormSection.tsx` | `DynamicFormSection` | `Order 5, 16` | `npx tsc --noEmit` |
| **18** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFeatureConfigForm.tsx` | `DynamicFeatureConfigForm` | `Order 17` | `npx tsc --noEmit` |
| **19** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | `Order 18` | `npx tsc --noEmit` |
| **20** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/utils/feature-registry.ts` | `FEATURE_REGISTRY` | `Order 19` | `npx tsc --noEmit` |
| **21** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingBasicSection.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **22** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingSelectorsSection.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **23** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **24** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/SearchConfigTab/SearchUrlPatternSection.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **25** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/SearchConfigTab/SearchSelectorsSection.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **26** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx` | `Obsolete component` | `Order 19` | `npx tsc --noEmit` |
| **27** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx` | `Obsolete component` | `Order 18` | `npx tsc --noEmit` |
| **28** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx` | `Obsolete component` | `Order 18` | `npx tsc --noEmit` |
| **29** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureCodeSection.tsx` | `Obsolete component` | `Order 18` | `npx tsc --noEmit` |
| **30** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts` | `Barrel Exports` | `Order 27, 28, 29` | `npx tsc --noEmit` |
| **31** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/components/index.ts` | `Barrel Exports` | `Order 23, 26` | `npx tsc --noEmit` |

---

## Section 4. Code Changes (Unified Diff)
> **Action**: Khai báo các hằng số chung (kích thước modal, CSS container, nhãn engine, helper `isFieldVisible`, templates mặc định và hàm `getDefaultFormValuesFromSections`).

```typescript
import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FormEvaluationContext, FormSectionSchema, VisibilityCondition } from '../types';

export const FEATURE_MODAL_WIDTH = 1300;

export const FEATURE_SECTION_CONTAINER_CLASS =
    'border border-hub-border/60 bg-hub-section/20 rounded-xl p-4 sm:p-5 w-full shadow-sm';

export const isFieldVisible = (
    condition: VisibilityCondition | undefined,
    context: FormEvaluationContext,
): boolean => {
    if (condition === undefined) return true;
    if (typeof condition === 'boolean') return condition;
    if (Array.isArray(condition)) return condition.includes(context.service);
    if (typeof condition === 'function') return condition(context);
    return true;
};

export const SCRAPER_SERVICE_LABELS: Record<ScraperServiceEnum, string> = {
    [ScraperServiceEnum.GENERIC]: 'Generic HTML Parser',
    [ScraperServiceEnum.API]: 'API Scraper',
    [ScraperServiceEnum.LOCAL]: 'Local Folder Scraper',
};

export const SCRAPER_SERVICE_OPTIONS = Object.entries(SCRAPER_SERVICE_LABELS).map(
    ([value, label]) => ({
        label,
        value: value as ScraperServiceEnum,
    }),
);

export const DEFAULT_FEATURE_TEMPLATES: Record<
    DataProviderFeatureType,
    Record<ScraperServiceEnum, string>
> = {
    [DataProviderFeatureType.SCRAPING]: {
        [ScraperServiceEnum.GENERIC]: DEFAULT_PARSER_FUNCTION_GENERATOR,
        [ScraperServiceEnum.API]: DEFAULT_API_FUNCTION_GENERATOR,
        [ScraperServiceEnum.LOCAL]: DEFAULT_PARSER_FUNCTION_GENERATOR,
    },
    [DataProviderFeatureType.SEARCH]: {
        [ScraperServiceEnum.GENERIC]: DEFAULT_SEARCH_FUNCTION_GENERATOR,
        [ScraperServiceEnum.API]: DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
        [ScraperServiceEnum.LOCAL]: DEFAULT_SEARCH_FUNCTION_GENERATOR,
    },
};

export const getDefaultFormValuesFromSections = (
    sections: FormSectionSchema[],
    context: FormEvaluationContext,
): Record<string, unknown> => {
    const defaults: Record<string, unknown> = {};
    for (const section of sections) {
        if (!isFieldVisible(section.visibleWhen, context)) continue;
        for (const field of section.fields) {
            if (!isFieldVisible(field.visibleWhen, context)) continue;
            if (field.defaultValue !== undefined) {
                defaults[field.name] =
                    typeof field.defaultValue === 'function'
                        ? field.defaultValue(context)
                        : field.defaultValue;
            }
        }
    }
    return defaults;
};
```

---

### 3. `[NEW]` `src/app/(root)/scraping/features/constants/scraping.constants.ts`
> **Action**: Khai báo cấu hình form sections và default config riêng cho tính năng Scraping.

```typescript
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FormSectionSchema, ITargetConfig } from '../types';
import {
    DEFAULT_FEATURE_TEMPLATES,
    getDefaultFormValuesFromSections,
    SCRAPER_SERVICE_OPTIONS,
} from './common.constants';

export const SCRAPING_FORM_SECTIONS: FormSectionSchema[] = [
    {
        id: 'basic',
        title: 'Cấu hình chung',
        description: 'Lựa chọn công cụ trích xuất (Service Engine) phù hợp cho tính năng',
        icon: 'lucide:settings-2',
        fields: [
            {
                name: 'service',
                label: 'Service Engine',
                type: 'select',
                defaultValue: ScraperServiceEnum.GENERIC,
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng chọn engine' }],
                fieldProps: ({ isServiceDisabled }) => ({
                    options: SCRAPER_SERVICE_OPTIONS,
                    disabled: isServiceDisabled,
                }),
            },
        ],
    },
    {
        id: 'selectors_params',
        title: 'Bộ chọn (Selectors) & Tham số truy vấn',
        description: 'Thiết lập các bộ chọn DOM CSS hoặc tham số gọi API',
        icon: 'lucide:sliders',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'mainContentSelector',
                label: 'Selector nội dung chính',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: #product-detail, .item-list',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'waitForSelector',
                label: 'Selector chờ (Wait for selector)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: .price-tag, #loaded',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'userAgent',
                label: 'User Agent tùy chỉnh',
                type: 'text',
                defaultValue: '',
                placeholder: 'Mozilla/5.0...',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'queryParams',
                label: 'API Query Params',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: page={page}&limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
            {
                name: 'firstQueryParams',
                label: 'First Query Params (trang đầu)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
        ],
    },
    {
        id: 'limits',
        title: 'Giới hạn & Thời gian chờ',
        description: 'Kiểm soát số lượng kết quả, số lần thử lại và thời gian timeout',
        icon: 'lucide:repeat',
        fields: [
            {
                name: 'maxResults',
                label: 'Số kết quả tối đa',
                type: 'number',
                defaultValue: 10,
                placeholder: '10',
                gridSpan: ({ service }) => (service !== ScraperServiceEnum.LOCAL ? { xs: 24, sm: 8 } : 24),
                fieldProps: { min: 1, className: 'w-full' },
            },
            {
                name: 'retryDelay',
                label: 'Delay retry (ms)',
                type: 'number',
                defaultValue: 1000,
                placeholder: '1000',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'retryAttempts',
                label: 'Số lần thử lại',
                type: 'number',
                defaultValue: 3,
                placeholder: '3',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'timeout',
                label: 'Thời gian chờ Request (ms)',
                type: 'number',
                defaultValue: 30000,
                placeholder: '30000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 1000, className: 'w-full' },
            },
            {
                name: 'waitForTimeout',
                label: 'Thời gian chờ Selector (ms)',
                type: 'number',
                defaultValue: 5000,
                placeholder: '5000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
        ],
    },
    {
        id: 'advanced_network',
        title: 'Mạng & Trình duyệt Nâng cao',
        description: 'Tùy chọn mô phỏng trình duyệt, vượt bảo vệ chống bot và Headers/Cookies',
        icon: 'lucide:shield-check',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'isGetParentElement',
                label: 'Lấy phần tử cha',
                description: 'Trích xuất toàn bộ container bao ngoài của selector',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'stealthMode',
                label: 'Stealth Mode',
                description: 'Ẩn dấu vết tự động hóa để tránh bị trang web chặn',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cloudflareBypass',
                label: 'Vượt Cloudflare',
                description: 'Tự động giải thử thách Turnstile / Cloudflare challenge',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'javascriptEnabled',
                label: 'Bật JavaScript',
                description: 'Thực thi JavaScript để render nội dung web động',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'imagesEnabled',
                label: 'Tải hình ảnh',
                description: 'Tải tài nguyên hình ảnh (tắt để tăng tốc crawl)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cssEnabled',
                label: 'Tải CSS',
                description: 'Tải định dạng CSS styles (tắt để tiết kiệm băng thông)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'headers',
                label: 'Tùy chỉnh Headers (JSON)',
                description: 'Định cấu hình custom headers gửi kèm request HTTP',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { icon: 'lucide:code-2', defaultEmptyValue: '{\n  \n}' },
            },
            {
                name: 'cookies',
                label: 'Tùy chỉnh Cookies (JSON Array)',
                description: 'Đính kèm danh sách cookies cho session trình duyệt',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC],
                fieldProps: { icon: 'lucide:cookie', defaultEmptyValue: '[\n  \n]' },
            },
        ],
    },
    {
        id: 'code_generator',
        title: ({ service }) => {
            switch (service) {
                case ScraperServiceEnum.API:
                    return 'Mã nguồn Hàm API Response Parser (functionGenerator)';
                case ScraperServiceEnum.LOCAL:
                    return 'Mã nguồn Hàm Local File Parser (functionGenerator)';
                default:
                    return 'Mã nguồn Hàm HTML Parser (functionGenerator)';
            }
        },
        description: 'Hàm JavaScript xử lý dữ liệu trích xuất từ trang web hoặc phản hồi API',
        icon: 'lucide:code-2',
        fields: [
            {
                name: 'functionGenerator',
                label: ({ service }) => {
                    switch (service) {
                        case ScraperServiceEnum.API:
                            return 'Mã nguồn Hàm API Response Parser (functionGenerator)';
                        case ScraperServiceEnum.LOCAL:
                            return 'Mã nguồn Hàm Local File Parser (functionGenerator)';
                        default:
                            return 'Mã nguồn Hàm HTML Parser (functionGenerator)';
                    }
                },
                type: 'code_editor',
                defaultValue: ({ service }) =>
                    DEFAULT_FEATURE_TEMPLATES[DataProviderFeatureType.SCRAPING][service],
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng nhập nội dung hàm parser' }],
                fieldProps: { language: 'javascript' },
            },
        ],
    },
];

export const DEFAULT_TARGET_CONFIG: ITargetConfig = getDefaultFormValuesFromSections(
    SCRAPING_FORM_SECTIONS,
    {
        service: ScraperServiceEnum.GENERIC,
        featureType: DataProviderFeatureType.SCRAPING,
    },
) as ITargetConfig;
```

---

### 4. `[NEW]` `src/app/(root)/scraping/features/constants/search.constants.ts`
> **Action**: Khai báo cấu hình form sections và default config riêng cho tính năng Search.

```typescript
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FormSectionSchema, ISearchTargetConfig } from '../types';
import {
    DEFAULT_FEATURE_TEMPLATES,
    getDefaultFormValuesFromSections,
    SCRAPER_SERVICE_OPTIONS,
} from './common.constants';

export const SEARCH_FORM_SECTIONS: FormSectionSchema[] = [
    {
        id: 'basic_url',
        title: 'Cấu hình đường dẫn tìm kiếm',
        description: 'Lựa chọn engine và định dạng mẫu URL tìm kiếm cho từ khóa',
        icon: 'lucide:search',
        fields: [
            {
                name: 'service',
                label: 'Service Engine',
                type: 'select',
                defaultValue: ScraperServiceEnum.GENERIC,
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng chọn engine' }],
                fieldProps: ({ isServiceDisabled }) => ({
                    options: SCRAPER_SERVICE_OPTIONS,
                    disabled: isServiceDisabled,
                }),
            },
            {
                name: 'searchUrlPattern',
                label: 'Mẫu URL tìm kiếm (Search URL Pattern)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: https://example.com/search?q={query}',
                gridSpan: 12,
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                getRules: () => [{ required: true, message: 'Vui lòng nhập mẫu URL tìm kiếm' }],
            },
            {
                name: 'queryPlaceholder',
                label: 'Placeholder từ khóa',
                type: 'text',
                defaultValue: '{query}',
                placeholder: '{query}',
                gridSpan: 12,
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
            },
        ],
    },
    {
        id: 'selectors_params',
        title: 'Bộ chọn (Selectors) & Tham số truy vấn',
        description: 'Thiết lập các bộ chọn DOM CSS hoặc tham số gọi API',
        icon: 'lucide:sliders',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'resultSelector',
                label: 'Selector danh sách kết quả',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: .search-results, .product-grid',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'waitForSelector',
                label: 'Selector chờ (Wait for selector)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: .price-tag, #loaded',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'userAgent',
                label: 'User Agent tùy chỉnh',
                type: 'text',
                defaultValue: '',
                placeholder: 'Mozilla/5.0...',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'queryParams',
                label: 'API Query Params',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: page={page}&limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
            {
                name: 'firstQueryParams',
                label: 'First Query Params (trang đầu)',
                type: 'text',
                defaultValue: '',
                placeholder: 'Ví dụ: limit={limit}',
                gridSpan: { xs: 24, md: 12 },
                visibleWhen: [ScraperServiceEnum.API],
            },
        ],
    },
    {
        id: 'limits',
        title: 'Giới hạn & Thời gian chờ',
        description: 'Kiểm soát số lượng kết quả, số lần thử lại và thời gian timeout',
        icon: 'lucide:repeat',
        fields: [
            {
                name: 'maxResults',
                label: 'Số kết quả tối đa',
                type: 'number',
                defaultValue: 10,
                placeholder: '10',
                gridSpan: ({ service }) => (service !== ScraperServiceEnum.LOCAL ? { xs: 24, sm: 8 } : 24),
                fieldProps: { min: 1, className: 'w-full' },
            },
            {
                name: 'retryDelay',
                label: 'Delay retry (ms)',
                type: 'number',
                defaultValue: 1000,
                placeholder: '1000',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'retryAttempts',
                label: 'Số lần thử lại',
                type: 'number',
                defaultValue: 3,
                placeholder: '3',
                gridSpan: { xs: 24, sm: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
            {
                name: 'timeout',
                label: 'Thời gian chờ Request (ms)',
                type: 'number',
                defaultValue: 30000,
                placeholder: '30000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 1000, className: 'w-full' },
            },
            {
                name: 'waitForTimeout',
                label: 'Thời gian chờ Selector (ms)',
                type: 'number',
                defaultValue: 5000,
                placeholder: '5000',
                gridSpan: { xs: 24, sm: 12 },
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { min: 0, className: 'w-full' },
            },
        ],
    },
    {
        id: 'advanced_network',
        title: 'Mạng & Trình duyệt Nâng cao',
        description: 'Tùy chọn mô phỏng trình duyệt, vượt bảo vệ chống bot và Headers/Cookies',
        icon: 'lucide:shield-check',
        visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
        fields: [
            {
                name: 'isGetParentElement',
                label: 'Lấy phần tử cha',
                description: 'Trích xuất toàn bộ container bao ngoài của selector',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'stealthMode',
                label: 'Stealth Mode',
                description: 'Ẩn dấu vết tự động hóa để tránh bị trang web chặn',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cloudflareBypass',
                label: 'Vượt Cloudflare',
                description: 'Tự động giải thử thách Turnstile / Cloudflare challenge',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'javascriptEnabled',
                label: 'Bật JavaScript',
                description: 'Thực thi JavaScript để render nội dung web động',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'imagesEnabled',
                label: 'Tải hình ảnh',
                description: 'Tải tài nguyên hình ảnh (tắt để tăng tốc crawl)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'cssEnabled',
                label: 'Tải CSS',
                description: 'Tải định dạng CSS styles (tắt để tiết kiệm băng thông)',
                type: 'switch_card',
                defaultValue: false,
                gridSpan: { xs: 24, sm: 12, lg: 8 },
                visibleWhen: [ScraperServiceEnum.GENERIC],
            },
            {
                name: 'headers',
                label: 'Tùy chỉnh Headers (JSON)',
                description: 'Định cấu hình custom headers gửi kèm request HTTP',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC, ScraperServiceEnum.API],
                fieldProps: { icon: 'lucide:code-2', defaultEmptyValue: '{\n  \n}' },
            },
            {
                name: 'cookies',
                label: 'Tùy chỉnh Cookies (JSON Array)',
                description: 'Đính kèm danh sách cookies cho session trình duyệt',
                type: 'json_toggle',
                defaultValue: undefined,
                gridSpan: 24,
                visibleWhen: [ScraperServiceEnum.GENERIC],
                fieldProps: { icon: 'lucide:cookie', defaultEmptyValue: '[\n  \n]' },
            },
        ],
    },
    {
        id: 'code_generator',
        title: ({ service }) =>
            service === ScraperServiceEnum.API
                ? 'Mã nguồn Hàm Tìm kiếm API (functionGenerator)'
                : 'Mã nguồn Hàm Tìm kiếm HTML (functionGenerator)',
        description: 'Hàm JavaScript xử lý dữ liệu tìm kiếm từ trang web hoặc phản hồi API',
        icon: 'lucide:code-2',
        fields: [
            {
                name: 'functionGenerator',
                label: ({ service }) =>
                    service === ScraperServiceEnum.API
                        ? 'Mã nguồn Hàm Tìm kiếm API (functionGenerator)'
                        : 'Mã nguồn Hàm Tìm kiếm HTML (functionGenerator)',
                type: 'code_editor',
                defaultValue: ({ service }) =>
                    DEFAULT_FEATURE_TEMPLATES[DataProviderFeatureType.SEARCH][service],
                gridSpan: 24,
                getRules: () => [{ required: true, message: 'Vui lòng nhập nội dung hàm tìm kiếm' }],
                fieldProps: { language: 'javascript' },
            },
        ],
    },
];

export const DEFAULT_SEARCH_TARGET_CONFIG: ISearchTargetConfig =
    getDefaultFormValuesFromSections(SEARCH_FORM_SECTIONS, {
        service: ScraperServiceEnum.GENERIC,
        featureType: DataProviderFeatureType.SEARCH,
    }) as ISearchTargetConfig;
```

---

### 5. `[NEW]` `src/app/(root)/scraping/features/constants/index.ts`
> **Action**: Barrel export kết hợp các constant con và export `FEATURE_FORM_SECTIONS`, `getFeatureFormSections`, `getDefaultFormValues`.

```typescript
import { DataProviderFeatureType } from '../enums';
import type { FormEvaluationContext, FormSectionSchema } from '../types';
import { getDefaultFormValuesFromSections } from './common.constants';
import { SCRAPING_FORM_SECTIONS } from './scraping.constants';
import { SEARCH_FORM_SECTIONS } from './search.constants';

export * from './common.constants';
export * from './scraping.constants';
export * from './search.constants';

export const FEATURE_FORM_SECTIONS: Record<DataProviderFeatureType, FormSectionSchema[]> = {
    [DataProviderFeatureType.SCRAPING]: SCRAPING_FORM_SECTIONS,
    [DataProviderFeatureType.SEARCH]: SEARCH_FORM_SECTIONS,
};

export const getFeatureFormSections = (
    featureType: DataProviderFeatureType,
): FormSectionSchema[] => FEATURE_FORM_SECTIONS[featureType] || [];

export const getDefaultFormValues = (
    context: FormEvaluationContext,
): Record<string, unknown> => {
    const sections = getFeatureFormSections(context.featureType);
    return getDefaultFormValuesFromSections(sections, context);
};
```

---

### 6. `[DELETE]` `src/app/(root)/scraping/features/constants.ts`
> **Action**: Xóa bỏ file `constants.ts` cũ (thay thế bởi thư mục `constants/`).

---

### 7. `[MODIFY]` `src/app/(root)/scraping/features/hooks/useFeatureConfigForm.ts`
> **Action**: Dùng `DEFAULT_FEATURE_TEMPLATES` thay vì `checkService`.

```diff
@@ -1,7 +1,7 @@
 'use client';

 import { useCallback, useEffect } from 'react';
-import { checkService, DEFAULT_TARGET_CONFIG } from '../constants';
+import { DEFAULT_FEATURE_TEMPLATES, getDefaultFormValues } from '../constants';
 import { useFeatureModalContext } from '../context';
 import { ScraperServiceEnum } from '../enums';
 import type { ScrapingConfigFormValues, TargetConfig } from '../types';
@@ -23,7 +23,7 @@
 export const useFeatureConfigForm = <TValues extends ScrapingConfigFormValues>({
-    defaultTargetConfig = DEFAULT_TARGET_CONFIG,
+    defaultTargetConfig,
     getDefaultTemplate,
     extraInitialValues,
 }: UseFeatureConfigFormOptions<TValues> = {}): UseFeatureConfigFormReturn<TValues> => {
@@ -35,11 +35,14 @@
         const service =
             selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

+        const resolvedDefaultConfig =
+            defaultTargetConfig ||
+            (getDefaultFormValues({ service, featureType: feature.type }) as TargetConfig);
+
         const defaultTemplate = getDefaultTemplate
             ? getDefaultTemplate(service)
-            : checkService(service).defaultScrapingTemplate;
+            : DEFAULT_FEATURE_TEMPLATES[feature.type][service];

         const baseInitialValues = mapConfigToBaseFormValues({
             config,
             service,
             defaultTemplate,
-            defaultConfig: defaultTargetConfig,
+            defaultConfig: resolvedDefaultConfig,
         });
@@ -66,7 +69,7 @@
         (service: ScraperServiceEnum) => {
             const template = getDefaultTemplate
                 ? getDefaultTemplate(service)
-                : checkService(service).defaultScrapingTemplate;
+                : DEFAULT_FEATURE_TEMPLATES[feature.type][service];

             form.setFieldValue('functionGenerator', template);
         },
```

---

### 3. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Dùng `SCRAPER_SERVICE_LABELS` thay vì `checkService`.

```diff
@@ -2,7 +2,7 @@
 
 import { useCallback } from 'react';
 import { CustomFlex, CustomSwitch, CustomTag, CustomTypography } from '@/components/custom-antd';
-import { checkService } from '../../constants';
+import { SCRAPER_SERVICE_LABELS } from '../../constants';
 import { useFeatureModalContext } from '../../context';
 import { ConfigVersionType, DataProviderFeatureStatus } from '../../enums';
 import { formatDate } from '@/libs';
@@ -20,7 +20,7 @@
         onSwitchStatus,
     } = useFeatureModalContext();
 
-    const { label: serviceLabel } = checkService(currentService);
+    const serviceLabel = SCRAPER_SERVICE_LABELS[currentService] || 'Generic HTML Parser';
 
     const def = getFeatureDefinition(feature.type);
     const providerName = feature.dataProvider?.name;
```

---

### 4. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureSettingModal/index.tsx`
> **Action**: Render trực tiếp `DynamicFeatureConfigForm` trong tab config.

```diff
@@ -8,7 +8,6 @@
 import { FEATURE_MODAL_WIDTH } from '../../constants';
 import { useFeatureModalContext } from '../../context';
-import { getFeatureDefinition } from '../../utils';
+import { DynamicFeatureConfigForm } from '../ConfigFormCommon';
 import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
 import { FeatureTestTab } from '../FeatureTestTab';
@@ -24,8 +23,6 @@
     const [activeTabKey, setActiveTabKey] = useState<FeatureSettingTabKey>('config');
 
-    const def = getFeatureDefinition(feature.type);
-    const ConfigComponent = def.ConfigComponent;
 
     const tabItems = useMemo(
         () => [
             {
                 key: 'config',
                 label: (
                     <CustomFlex align="center" gap={6}>
                         <Icon icon="lucide:settings-2" className="text-base" />
                         <span className="font-medium">Cấu hình tính năng</span>
                     </CustomFlex>
                 ),
                 children: (
                     <div className="h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar py-1 pr-1">
-                        <ConfigComponent />
+                        <DynamicFeatureConfigForm />
                     </div>
                 ),
             },
```

---

### 5. `[MODIFY]` `src/app/(root)/scraping/features/utils/feature-registry.ts`
> **Action**: Xóa bỏ thuộc tính `ConfigComponent` và các imports `ScrapingConfigTab`, `SearchConfigTab`.

```diff
@@ -1,7 +1,5 @@
-import type { ComponentType } from 'react';
-import { ScrapingConfigTab, SearchConfigTab } from '../components';
 import { DataProviderFeatureType } from '../enums';
 export type FeatureDefinition = {
     type: DataProviderFeatureType;
     icon: string;
     label: string;
     shortLabel: string;
     accentClass: string;
     description: string;
-    ConfigComponent: ComponentType;
     getTitle: (isDraft: boolean, providerName?: string) => string;
 };

 export const FEATURE_REGISTRY: Record<DataProviderFeatureType, FeatureDefinition> = {
     [DataProviderFeatureType.SCRAPING]: {
         type: DataProviderFeatureType.SCRAPING,
         icon: 'lucide:bot',
         label: 'Cào dữ liệu (Scraping)',
         shortLabel: 'Scraping',
         accentClass: 'text-emerald-500 bg-emerald-500/10',
         description: 'Cào dữ liệu tự động từ nhà cung cấp',
-        ConfigComponent: ScrapingConfigTab,
         getTitle: (isDraft, providerName) => ...
     },
     [DataProviderFeatureType.SEARCH]: {
         type: DataProviderFeatureType.SEARCH,
         icon: 'lucide:search',
         label: 'Tìm kiếm (Search)',
         shortLabel: 'Search',
         accentClass: 'text-indigo-500 bg-indigo-500/10',
         description: 'Tìm kiếm sản phẩm từ nhà cung cấp',
-        ConfigComponent: SearchConfigTab,
         getTitle: (isDraft, providerName) => ...
     },
 };
```

---

### 6. `[MODIFY]` `src/app/(root)/scraping/features/components/FeatureCardDetail/FeatureCardHeader.tsx`
> **Action**: Dùng `SCRAPER_SERVICE_LABELS` thay vì `checkService`.

```diff
@@ -2,7 +2,7 @@
 
 import { CustomCard, CustomFlex, CustomTag } from '@/components/custom-antd';
 import { Icon } from '@iconify/react';
-import { checkService } from '../../constants';
+import { SCRAPER_SERVICE_LABELS } from '../../constants';
 import { useFeatureCardContext } from '../../context';
 import { DataProviderFeatureStatus, DataProviderFeatureType } from '../../enums';
 import { getFeatureDefinition } from '../../utils';
@@ -8,7 +8,7 @@
 export const FeatureCardHeader = () => {
     const { feature, isPendingStatus } = useFeatureCardContext();
 
-    const { label: serviceLabel } = checkService(feature.service);
+    const serviceLabel = SCRAPER_SERVICE_LABELS[feature.service] || 'Generic HTML Parser';
     const def = getFeatureDefinition(feature.type);
```

---

### 7. `[NEW]` Widgets trong thư mục `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/`

#### 7.1 `[NEW]` `TextFieldWidget.tsx`
```tsx
'use client';

import { CustomCol, CustomForm, CustomInput } from '@/components/custom-antd';
import type { FormEvaluationContext, TextFormFieldSchema } from '../../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type TextFieldWidgetProps = {
    schema: TextFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const TextFieldWidget = ({ schema, evaluationContext, colProps }: TextFieldWidgetProps) => {
    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const rules = schema.getRules ? schema.getRules(evaluationContext) : undefined;
    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
                rules={rules}
            >
                <CustomInput placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
```

#### 7.2 `[NEW]` `SelectFieldWidget.tsx`
```tsx
'use client';

import { CustomCol, CustomForm, CustomSelect } from '@/components/custom-antd';
import type { FormEvaluationContext, SelectFormFieldSchema } from '../../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type SelectFieldWidgetProps = {
    schema: SelectFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const SelectFieldWidget = ({ schema, evaluationContext, colProps }: SelectFieldWidgetProps) => {
    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const rules = schema.getRules ? schema.getRules(evaluationContext) : undefined;
    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
                rules={rules}
            >
                <CustomSelect {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
```

#### 7.3 `[NEW]` `NumberFieldWidget.tsx`
```tsx
'use client';

import { CustomCol, CustomForm, CustomInputNumber } from '@/components/custom-antd';
import type { FormEvaluationContext, NumberFormFieldSchema } from '../../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type NumberFieldWidgetProps = {
    schema: NumberFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const NumberFieldWidget = ({ schema, evaluationContext, colProps }: NumberFieldWidgetProps) => {
    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const rules = schema.getRules ? schema.getRules(evaluationContext) : undefined;
    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
                rules={rules}
            >
                <CustomInputNumber placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
```

#### 7.4 `[NEW]` `SwitchCardWidget.tsx`
```tsx
'use client';

import { CustomCol, CustomFlex, CustomForm, CustomSwitch, CustomTypography } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../../context';
import type { FormEvaluationContext, SwitchCardFormFieldSchema } from '../../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type SwitchCardWidgetProps = {
    schema: SwitchCardFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const SwitchCardWidget = ({ schema, evaluationContext, colProps }: SwitchCardWidgetProps) => {
    const { isViewingHistory } = useFeatureModalContext();

    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const desc =
        typeof schema.description === 'function'
            ? schema.description(evaluationContext)
            : schema.description;
    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomFlex
                gap="small"
                align="flex-start"
                justify="space-between"
                className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
            >
                <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                    <CustomTypography.Text className="text-sm text-hub-title font-medium">
                        <FormDiffLabel fieldKey={schema.name} label={labelText as string} />
                    </CustomTypography.Text>
                    {desc && (
                        <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                            {desc}
                        </CustomTypography.Text>
                    )}
                </CustomFlex>
                <CustomForm.Item name={schema.name} valuePropName="checked" noStyle>
                    <CustomSwitch className="mt-0.5" disabled={isViewingHistory} {...rawProps} />
                </CustomForm.Item>
            </CustomFlex>
        </CustomCol>
    );
};
```

#### 7.5 `[NEW]` `CodeEditorWidget.tsx`
```tsx
'use client';

import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomForm } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../../context';
import type { CodeEditorFormFieldSchema, FormEvaluationContext } from '../../../types';

export type CodeEditorWidgetProps = {
    schema: CodeEditorFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const CodeEditorWidget = ({ schema, evaluationContext, colProps }: CodeEditorWidgetProps) => {
    const { form } = useFeatureModalContext();
    const codeValue = CustomForm.useWatch(schema.name, form);
    const rules = schema.getRules ? schema.getRules(evaluationContext) : undefined;
    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item name={schema.name} rules={rules} noStyle>
                <CodeDisplay
                    isDisplayLanguage
                    language={(rawProps.language as string) || 'javascript'}
                    code={codeValue || ''}
                    onCodeChange={(newCode: string): void => {
                        form.setFieldValue(schema.name, newCode);
                    }}
                />
            </CustomForm.Item>
        </CustomCol>
    );
};
```

#### 7.6 `[NEW]` `JsonToggleWidget.tsx`
```tsx
'use client';

import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomFlex, CustomForm, CustomSwitch, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import { useFeatureModalContext } from '../../../context';
import type { FormEvaluationContext, JsonToggleFormFieldSchema } from '../../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type JsonToggleWidgetProps = {
    schema: JsonToggleFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const JsonToggleWidget = ({ schema, evaluationContext, colProps }: JsonToggleWidgetProps) => {
    const { form, isViewingHistory } = useFeatureModalContext();
    const fieldValue = CustomForm.useWatch(schema.name, form);
    const rawProps =
        (typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps) || {};
    const iconName = (rawProps.icon as string) || 'lucide:code-2';
    const defaultEmptyValue = (rawProps.defaultEmptyValue as string) || '{\n  \n}';

    const [hasContent, setHasContent] = useState<boolean>(Boolean(fieldValue?.trim()));
    const cachedValueRef = useRef<string>(fieldValue || '');

    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;
    const desc =
        typeof schema.description === 'function'
            ? schema.description(evaluationContext)
            : schema.description;

    useEffect(() => {
        if (fieldValue && fieldValue.trim()) {
            setHasContent(true);
            cachedValueRef.current = fieldValue;
        } else if (!fieldValue) {
            setHasContent(false);
        }
    }, [fieldValue]);

    const handleToggle = (checked: boolean) => {
        setHasContent(checked);
        if (checked) {
            const restored = cachedValueRef.current || defaultEmptyValue;
            form.setFieldValue(schema.name, restored);
        } else {
            if (fieldValue) cachedValueRef.current = fieldValue;
            form.setFieldValue(schema.name, undefined);
        }
    };

    return (
        <CustomCol {...colProps}>
            <CustomFlex vertical gap={12} className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50">
                <CustomFlex align="center" justify="space-between" className="w-full">
                    <CustomFlex align="center" gap="small">
                        <Icon icon={iconName} className="text-base text-hub-primary" />
                        <CustomFlex vertical gap={2}>
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel fieldKey={schema.name} label={labelText as string} />
                            </CustomTypography.Text>
                            {desc && (
                                <CustomTypography.Text className="text-xs text-hub-subtitle">
                                    {desc}
                                </CustomTypography.Text>
                            )}
                        </CustomFlex>
                    </CustomFlex>
                    <CustomSwitch checked={hasContent} onChange={handleToggle} disabled={isViewingHistory} />
                </CustomFlex>

                {hasContent ? (
                    <CustomForm.Item name={schema.name} className="!mb-0">
                        <CodeDisplay
                            language="json"
                            isDisplayLanguage
                            maxHeight="160px"
                            code={fieldValue || ''}
                            onCodeChange={(newCode: string): void => {
                                cachedValueRef.current = newCode;
                                form.setFieldValue(schema.name, newCode);
                            }}
                        />
                    </CustomForm.Item>
                ) : (
                    <CustomTypography.Text className="text-xs text-hub-subtitle italic">
                        Chưa kích hoạt tùy chỉnh {labelText as string}
                    </CustomTypography.Text>
                )}
            </CustomFlex>
        </CustomCol>
    );
};
```

#### 7.7 `[NEW]` `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormField/index.tsx`
```tsx
'use client';

import { isFieldVisible } from '../../../constants';
import type { FormEvaluationContext, FormFieldSchema } from '../../../types';
import { CodeEditorWidget } from './CodeEditorWidget';
import { JsonToggleWidget } from './JsonToggleWidget';
import { NumberFieldWidget } from './NumberFieldWidget';
import { SelectFieldWidget } from './SelectFieldWidget';
import { SwitchCardWidget } from './SwitchCardWidget';
import { TextFieldWidget } from './TextFieldWidget';

export type DynamicFormFieldProps = {
    schema: FormFieldSchema;
    evaluationContext: FormEvaluationContext;
};

export const DynamicFormField = ({ schema, evaluationContext }: DynamicFormFieldProps) => {
    if (!isFieldVisible(schema.visibleWhen, evaluationContext)) {
        return null;
    }

    const span =
        typeof schema.gridSpan === 'function'
            ? schema.gridSpan(evaluationContext)
            : schema.gridSpan || 24;

    const colProps = typeof span === 'number' ? { span } : span;

    switch (schema.type) {
        case 'select':
            return <SelectFieldWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        case 'text':
            return <TextFieldWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        case 'number':
            return <NumberFieldWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        case 'switch_card':
            return <SwitchCardWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        case 'code_editor':
            return <CodeEditorWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        case 'json_toggle':
            return <JsonToggleWidget schema={schema} evaluationContext={evaluationContext} colProps={colProps} />;
        default:
            return null;
    }
};

export * from './CodeEditorWidget';
export * from './JsonToggleWidget';
export * from './NumberFieldWidget';
export * from './SelectFieldWidget';
export * from './SwitchCardWidget';
export * from './TextFieldWidget';
```

---

### 8. `[NEW]` `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFormSection.tsx`
> **Action**: Render section card header và grid `CustomRow`/`CustomCol` chứa các field hợp lệ.

```tsx
'use client';

import { CustomFlex, CustomRow } from '@/components/custom-antd';
import { FEATURE_SECTION_CONTAINER_CLASS, isFieldVisible } from '../../constants';
import type { FormEvaluationContext, FormSectionSchema } from '../../types';
import { DynamicFormField } from './DynamicFormField';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export type DynamicFormSectionProps = {
    section: FormSectionSchema;
    evaluationContext: FormEvaluationContext;
};

export const DynamicFormSection = ({ section, evaluationContext }: DynamicFormSectionProps) => {
    if (!isFieldVisible(section.visibleWhen, evaluationContext)) {
        return null;
    }

    const titleContent =
        typeof section.title === 'function' ? section.title(evaluationContext) : section.title;
    const descriptionContent =
        typeof section.description === 'function'
            ? section.description(evaluationContext)
            : section.description;
    const iconName =
        typeof section.icon === 'function'
            ? section.icon(evaluationContext)
            : section.icon || 'lucide:sliders';

    const visibleFields = section.fields.filter((f) =>
        isFieldVisible(f.visibleWhen, evaluationContext),
    );

    if (visibleFields.length === 0) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon={iconName}
                title={
                    typeof titleContent === 'string' ? (
                        titleContent
                    ) : (
                        <FormDiffLabel label={titleContent as any} fieldKey={section.fields[0]?.name || ''} />
                    )
                }
                description={descriptionContent}
            />
            <CustomRow gutter={[16, 12]}>
                {visibleFields.map((fieldSchema) => (
                    <DynamicFormField
                        key={fieldSchema.name}
                        schema={fieldSchema}
                        evaluationContext={evaluationContext}
                    />
                ))}
            </CustomRow>
        </CustomFlex>
    );
};
```

---

### 9. `[NEW]` `src/app/(root)/scraping/features/components/ConfigFormCommon/DynamicFeatureConfigForm.tsx`
> **Action**: Container Form tổng hợp, kết nối `useFeatureConfigForm` với `FEATURE_FORM_SECTIONS`.

```tsx
'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { useMemo } from 'react';
import { DEFAULT_FEATURE_TEMPLATES, DEFAULT_TARGET_CONFIG, getFeatureFormSections } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { useFeatureConfigForm } from '../../hooks';
import type { FormEvaluationContext, ScrapingConfigFormValues, TargetConfig } from '../../types';
import { DynamicFormSection } from './DynamicFormSection';

export type DynamicFeatureConfigFormProps<TValues extends ScrapingConfigFormValues = ScrapingConfigFormValues> = {
    defaultTargetConfig?: TargetConfig;
    getDefaultTemplate?: (service: any) => string;
    extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
};

export const DynamicFeatureConfigForm = <TValues extends ScrapingConfigFormValues = ScrapingConfigFormValues>({
    defaultTargetConfig = DEFAULT_TARGET_CONFIG,
    getDefaultTemplate,
    extraInitialValues,
}: DynamicFeatureConfigFormProps<TValues>) => {
    const { form, currentService, feature, isViewingHistory } = useFeatureModalContext();

    const { handleSave } = useFeatureConfigForm<TValues>({
        defaultTargetConfig,
        getDefaultTemplate:
            getDefaultTemplate || ((service) => DEFAULT_FEATURE_TEMPLATES[feature.type][service]),
        extraInitialValues,
    });

    const isServiceDisabled = Boolean(feature?.id || isViewingHistory);

    const evaluationContext: FormEvaluationContext = useMemo(
        () => ({
            service: currentService,
            featureType: feature.type,
            isViewingHistory,
            isServiceDisabled,
        }),
        [currentService, feature.type, isViewingHistory, isServiceDisabled],
    );

    const sections = getFeatureFormSections(feature.type);

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                {sections.map((section) => (
                    <DynamicFormSection
                        key={section.id}
                        section={section}
                        evaluationContext={evaluationContext}
                    />
                ))}
            </CustomFlex>
        </CustomForm>
    );
};
```

---

### 10, 11, 12, 13. `[MODIFY]` & `[DELETE]` trong `ConfigFormCommon/`
> **Action**: Xóa bỏ các component hardcode cũ và cập nhật barrel export.

- `[DELETE]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureLimitsSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureAdvancedSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/ConfigFormCommon/FeatureCodeSection.tsx`

`[MODIFY]` `src/app/(root)/scraping/features/components/ConfigFormCommon/index.ts`:
```diff
@@ -1,7 +1,7 @@
 export * from './ConfigGroupContainer';
-export * from './FeatureAdvancedSection';
-export * from './FeatureCodeSection';
-export * from './FeatureLimitsSection';
+export * from './DynamicFeatureConfigForm';
+export * from './DynamicFormField';
+export * from './DynamicFormSection';
 export * from './FormDiffLabel';
 export * from './SectionHeader';
```

---

### 14, 15. `[DELETE]` toàn bộ 2 thư mục `ScrapingConfigTab/` & `SearchConfigTab/`
> **Action**: Xóa bỏ toàn bộ 6 file trong 2 thư mục này.

- `[DELETE]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingBasicSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/ScrapingSelectorsSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/ScrapingConfigTab/index.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/SearchConfigTab/SearchUrlPatternSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/SearchConfigTab/SearchSelectorsSection.tsx`
- `[DELETE]` `src/app/(root)/scraping/features/components/SearchConfigTab/index.tsx`

`[MODIFY]` `src/app/(root)/scraping/features/components/index.ts`:
```diff
@@ -5,5 +5,3 @@
 export * from './FeatureHistoryModal';
 export * from './FeatureSettingModal';
 export * from './FeatureTestTab';
-export * from './ScrapingConfigTab';
-export * from './SearchConfigTab';
```

---

## Section 5. Test Cases & Verification

### Automated Tests
- Type checking & Next.js build validation:
  ```bash
  npx tsc --noEmit
  # Result: PASS (exit code 0, 0 errors)
  ```
- Lint checks:
  ```bash
  npm run lint:fix
  # Result: PASS (exit code 0, 0 errors, 0 warnings)
  ```

### Manual Verification
1. **Kiểm tra Scraping Config Tab**:
   - Mở modal cấu hình cho Scraping Feature.
   - Chuyển đổi giữa `Generic HTML Parser`, `API Scraper`, và `Local Folder Scraper`:
     - Kiểm tra các trường DOM Selector, Query Params, Browser Settings ẩn/hiện chính xác theo schema.
     - Kiểm tra template code tự động cập nhật theo engine được chọn từ `DEFAULT_FEATURE_TEMPLATES`.
2. **Kiểm tra Search Config Tab**:
   - Mở modal cấu hình cho Search Feature.
   - Kiểm tra hiển thị trường `searchUrlPattern` và `queryPlaceholder`.
   - Kiểm tra validation required khi để trống `searchUrlPattern`.
3. **Kiểm tra Advanced Settings & JSON Code Editors**:
   - Bật/tắt switch `Headers` và `Cookies`: kiểm tra Monaco JSON code editor hiển thị và lưu state bình thường.
   - Bật/tắt các switch Browser Settings (Stealth mode, Cloudflare bypass, v.v.).
4. **Kiểm tra Diff Label & Version History**:
   - Mở tab Lịch sử phiên bản, kiểm tra `FormDiffLabel` highlight các trường có thay đổi chính xác.
