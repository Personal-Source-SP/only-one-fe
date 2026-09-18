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
import type { IOption } from './component';

export type FormFieldType =
    'input' | 'number' | 'password' | 'textarea' | 'select' | 'switch' | 'custom';

export type { IOption };

export interface IFieldFormConfig {
    colSpan?: number;
    type?: FormFieldType;
    placeholder?: string;
    rulesConfig?: FormRuleConfig[];
}

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
