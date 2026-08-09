'use client';

import {
    CustomForm,
    CustomInput,
    CustomInputNumber,
    type FormItemProps,
    type InputNumberProps,
    type InputProps,
    type PasswordProps,
    type TextAreaProps,
} from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';
import { HtmlEditor, type HtmlEditorProps } from '@/components/common';

export enum CustomInputFormType {
    Html = 'html',
    Text = 'text',
    Number = 'number',
    Password = 'password',
    TextArea = 'textarea',
}

export type CustomInputFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    type?: CustomInputFormType;
    rulesConfig?: FormRuleConfig[];
    inputProps?: InputProps;
    numberProps?: InputNumberProps<number>;
    passwordProps?: PasswordProps;
    textAreaProps?: TextAreaProps;
    htmlEditorProps?: HtmlEditorProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomInputForm = ({
    label,
    name,
    type = CustomInputFormType.Text,
    rulesConfig,
    inputProps,
    numberProps,
    passwordProps,
    textAreaProps,
    htmlEditorProps,
    formItemProps,
}: CustomInputFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    const inputNode = useMemo(() => {
        switch (type) {
            case CustomInputFormType.Html:
                return <HtmlEditor {...htmlEditorProps} />;
            case CustomInputFormType.Number:
                return <CustomInputNumber size="large" className="w-full" {...numberProps} />;
            case CustomInputFormType.Password:
                return <CustomInput.Password size="large" {...passwordProps} />;
            case CustomInputFormType.TextArea:
                return <CustomInput.TextArea size="large" {...textAreaProps} />;
            case CustomInputFormType.Text:
                return <CustomInput size="large" {...inputProps} />;
        }
    }, [htmlEditorProps, inputProps, numberProps, passwordProps, textAreaProps, type]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            {inputNode}
        </CustomForm.Item>
    );
};
