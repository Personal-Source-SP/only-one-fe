import type { CustomSelectProps, Rule, SelectProps } from '@/components/custom-antd';
import type { ReactNode } from 'react';
import type { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { ISearchTargetConfigSpecific, ITargetConfig } from './target-config.types';

export interface ScrapingConfigFormValues extends Omit<
    Partial<ITargetConfig>,
    'headers' | 'cookies' | 'service'
> {
    service: ScraperServiceEnum;
    changeDescription?: string;
    headers?: string;
    cookies?: string;
}

export interface SearchConfigFormValues
    extends
        ScrapingConfigFormValues,
        Omit<Partial<ISearchTargetConfigSpecific>, 'searchUrlPattern'> {
    searchUrlPattern: string;
}

export interface TestInputFormValues {
    testUrl?: string;
    testQuery?: string;
    htmlContentString?: string;
}

// ==========================================
// FORM EVALUATION CONTEXT & GRID TYPES
// ==========================================

export interface FormEvaluationContext {
    service: ScraperServiceEnum;
    featureType: DataProviderFeatureType;
    isViewingHistory?: boolean;
    isServiceDisabled?: boolean;
    currentValues?: Record<string, unknown>;
}

export type GridSpanObject = {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    span?: number;
};

export type GridSpanValue = number | GridSpanObject;

export type Evaluatable<T> = T | ((context: FormEvaluationContext) => T);

export type VisibilityCondition =
    boolean | ScraperServiceEnum[] | ((context: FormEvaluationContext) => boolean);

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

export type IFormFieldSchema =
    | SelectFormFieldSchema
    | TextFormFieldSchema
    | NumberFormFieldSchema
    | SwitchCardFormFieldSchema
    | CodeEditorFormFieldSchema
    | JsonToggleFormFieldSchema;

export type FormFieldType = IFormFieldSchema['type'];

// Backward compatibility alias
export type FormFieldSchema = IFormFieldSchema;

// ==========================================
// FORM SECTION & METADATA SCHEMAS
// ==========================================

export type IFormSectionSchema = {
    id: string;
    title: Evaluatable<ReactNode>;
    description?: Evaluatable<string>;
    icon?: Evaluatable<string>;
    visibleWhen?: VisibilityCondition;
    fields: IFormFieldSchema[];
};

// Backward compatibility alias
export type FormSectionSchema = IFormSectionSchema;

export type ScraperFieldRuleConfig = {
    required?: boolean;
    message?: string;
};
