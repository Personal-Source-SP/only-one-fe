import type {
    CustomCheckbox,
    CustomCheckboxProps,
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
import type { IOption } from './component';

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

export type { IOption };

export interface IFieldFormConfig {
    colSpan?: number;
    type?: FormFieldType;
    placeholder?: string;
    description?: ReactNode;
    rulesConfig?: FormRuleConfig[];
}

export interface IBaseFormField<TValues = unknown> {
    name: keyof TValues | string;
    label?: ReactNode;
    description?: ReactNode;
    colSpan?: number;
    rulesConfig?: FormRuleConfig[];
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
    disabled?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

export interface IInputFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type?: 'input';
    placeholder?: string;
    addonAfter?:
        ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
    addonBefore?:
        ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
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
    switchProps?: SwitchProps;
}

export interface ICustomFormField<TValues = unknown> extends IBaseFormField<TValues> {
    type: 'custom';
    render: (form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode;
}

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
    editorProps?: Omit<
        IHtmlEditorFieldProps,
        'value' | 'onChange' | 'placeholder' | 'rows' | 'disabled'
    >;
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
    options?: ComponentProps<typeof CustomCheckbox.Group>['options'];
    checkboxGroupProps?: ComponentProps<typeof CustomCheckbox.Group>;
}

export type IFormField<TValues = unknown> =
    | IInputFormField<TValues>
    | INumberFormField<TValues>
    | IPasswordFormField<TValues>
    | ITextAreaFormField<TValues>
    | ISelectFormField<TValues>
    | ISwitchFormField<TValues>
    | IDatePickerFormField<TValues>
    | IRangePickerFormField<TValues>
    | IUploadFormField<TValues>
    | IHtmlEditorFormField<TValues>
    | ICodeEditorFormField<TValues>
    | IJsonToggleFormField<TValues>
    | IRadioGroupFormField<TValues>
    | ICheckboxGroupFormField<TValues>
    | ICustomFormField<TValues>;

// ==========================================
// POLYMORPHIC FORM SECTION CONTRACTS
// ==========================================

export type FormSectionType = 'card' | 'plain' | 'collapse' | 'tabs';

/**
 * Interface cơ sở tối giản chứa các thuộc tính dùng chung 100% của mọi Form Section.
 */
export interface IBaseFormSection<TValues = unknown> {
    type: FormSectionType;
    id?: string;
    className?: string;
    visible?: boolean | ((mode: FormMode, form?: FormInstance<TValues>) => boolean);
}

/**
 * Interface cơ sở cho các Section chứa danh sách field trực tiếp.
 */
export interface IFieldFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    fields: IFormField<TValues>[];
    gutter?: [number, number];
}

/**
 * Section dạng Plain (không có khung viền Card / Collapse, chỉ có text title/description đơn giản).
 */
export interface IPlainFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
    type: 'plain';
    title?: ReactNode;
    description?: ReactNode;
}

/**
 * Interface cơ sở cho các Section có Header đầy đủ (hỗ trợ icon, badge, extra, collapsible).
 */
export interface IHeaderFormSection<TValues = unknown> extends IFieldFormSection<TValues> {
    icon?: string;
    title?: ReactNode;
    badge?: ReactNode;
    extra?: ReactNode;
    badgeColor?: string;
    description?: ReactNode;
}

/**
 * Section dạng Card (khung viền Card, header đầy đủ và danh sách fields).
 */
export interface ICardFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
    type: 'card';
}

/**
 * Section dạng Collapse (khung viền, header hỗ trợ đóng mở accordion).
 */
export interface ICollapseFormSection<TValues = unknown> extends IHeaderFormSection<TValues> {
    type: 'collapse';
    defaultCollapsed?: boolean;
}

/**
 * Item cấu hình cho từng tab trong TabsFormSection.
 */
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

/**
 * Section dạng Tabs (phân tách fields theo tab navigation).
 */
export interface ITabsFormSection<TValues = unknown> extends IBaseFormSection<TValues> {
    type: 'tabs';
    items: IFormTabItem<TValues>[];
    activeKey?: string;
    defaultActiveKey?: string;
    tabsProps?: Omit<CustomTabsProps, 'items' | 'activeKey' | 'defaultActiveKey' | 'onChange'>;
    onChange?: (activeKey: string) => void;
}

export type IFormSection<TValues = unknown> =
    | ICardFormSection<TValues>
    | IPlainFormSection<TValues>
    | ICollapseFormSection<TValues>
    | ITabsFormSection<TValues>;
