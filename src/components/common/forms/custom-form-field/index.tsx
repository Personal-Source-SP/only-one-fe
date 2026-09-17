'use client';

import {
    CustomInputForm,
    CustomInputFormType,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
import { CustomCol } from '@/components/custom-antd';
import type { ReactNode } from 'react';
import type {
    CustomFormFieldProps,
    ICustomFormField,
    IInputFormField,
    INumberFormField,
    IPasswordFormField,
    ISelectFormField,
    ISwitchFormField,
    ITextAreaFormField,
} from './types';

export * from './types';

export const CustomFormField = <TValues extends object = Record<string, unknown>>({
    field,
    form,
    mode,
    withCol = true,
}: CustomFormFieldProps<TValues>) => {
    const { name, label, rulesConfig, disabled, formItemProps } = field;

    const colSpan = field.colSpan ?? 24;
    const isDisabled = typeof disabled === 'function' ? disabled(mode, form) : disabled;

    let fieldContent: ReactNode = null;

    if (field.type === 'custom' || ('render' in field && field.render)) {
        fieldContent = (field as ICustomFormField<TValues>).render(form, mode);
    } else {
        switch (field.type) {
            case 'select': {
                const selectField = field as ISelectFormField<TValues>;
                fieldContent = (
                    <CustomSelectInput
                        name={name as any}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        selectProps={{
                            disabled: isDisabled,
                            options: selectField.options,
                            placeholder: selectField.placeholder,
                            ...selectField.selectProps,
                        }}
                    />
                );
                break;
            }
            case 'switch': {
                const switchField = field as ISwitchFormField<TValues>;
                fieldContent = (
                    <CustomSwitchForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        description={switchField.description}
                        switchProps={{
                            disabled: isDisabled,
                            ...switchField.switchProps,
                        }}
                    />
                );
                break;
            }
            case 'textarea': {
                const textField = field as ITextAreaFormField<TValues>;
                fieldContent = (
                    <CustomInputForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        type={CustomInputFormType.TextArea}
                        textAreaProps={{
                            disabled: isDisabled,
                            placeholder: textField.placeholder,
                            ...textField.textAreaProps,
                        }}
                    />
                );
                break;
            }
            case 'number': {
                const numberField = field as INumberFormField<TValues>;
                fieldContent = (
                    <CustomInputForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        type={CustomInputFormType.Number}
                        numberProps={{
                            disabled: isDisabled,
                            placeholder: numberField.placeholder,
                            ...numberField.numberProps,
                        }}
                    />
                );
                break;
            }
            case 'password': {
                const passwordField = field as IPasswordFormField<TValues>;
                fieldContent = (
                    <CustomInputForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        type={CustomInputFormType.Password}
                        passwordProps={{
                            disabled: isDisabled,
                            placeholder: passwordField.placeholder,
                            ...passwordField.passwordProps,
                        }}
                    />
                );
                break;
            }
            case 'input':
            default: {
                const inputField = field as IInputFormField<TValues>;
                const resolvedAddonAfter =
                    typeof inputField.addonAfter === 'function'
                        ? inputField.addonAfter(form, mode)
                        : inputField.addonAfter;
                const resolvedAddonBefore =
                    typeof inputField.addonBefore === 'function'
                        ? inputField.addonBefore(form, mode)
                        : inputField.addonBefore;

                fieldContent = (
                    <CustomInputForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        inputProps={{
                            disabled: isDisabled,
                            addonAfter: resolvedAddonAfter,
                            addonBefore: resolvedAddonBefore,
                            placeholder: inputField.placeholder,
                            ...inputField.inputProps,
                        }}
                    />
                );
                break;
            }
        }
    }

    if (!withCol) {
        return fieldContent;
    }

    return (
        <CustomCol key={String(name)} span={colSpan}>
            {fieldContent}
        </CustomCol>
    );
};
