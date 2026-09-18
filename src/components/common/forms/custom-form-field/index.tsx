'use client';

import {
    CustomInputForm,
    CustomInputFormType,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
import type { FormInstance } from '@/components/custom-antd';
import { CustomCol } from '@/components/custom-antd';
import type { FormMode } from '@/hooks';
import type {
    ICustomFormField,
    IFormField,
    IInputFormField,
    INumberFormField,
    IPasswordFormField,
    ISelectFormField,
    ISwitchFormField,
    ITextAreaFormField,
} from '@/interfaces';
import { useCallback, useMemo, type ReactNode } from 'react';
export type {
    IBaseFormField,
    ICustomFormField,
    IFormField,
    IInputFormField,
    INumberFormField,
    IPasswordFormField,
    ISelectFormField,
    ISwitchFormField,
    ITextAreaFormField,
} from '@/interfaces';

export type CustomFormFieldProps<TValues = unknown> = {
    mode: FormMode;
    field: IFormField<TValues>;
    withCol?: boolean;
    form?: FormInstance<TValues>;
};

export const CustomFormField = <TValues extends object = Record<string, unknown>>({
    mode,
    field,
    withCol = true,
    form,
}: CustomFormFieldProps<TValues>) => {
    const { name, label, rulesConfig, disabled, formItemProps } = field;

    const colSpan = useMemo(() => field.colSpan ?? 24, [field.colSpan]);

    const isDisabled = useMemo(
        () => (typeof disabled === 'function' ? disabled(mode, form) : disabled),
        [disabled, mode, form],
    );

    const renderFieldContent = useCallback((): ReactNode => {
        if (field.type === 'custom' || ('render' in field && field.render)) {
            return (field as ICustomFormField<TValues>).render(form, mode);
        }

        switch (field.type) {
            case 'select': {
                const selectField = field as ISelectFormField<TValues>;
                return (
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
            }
            case 'switch': {
                const switchField = field as ISwitchFormField<TValues>;
                return (
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
            }
            case 'textarea': {
                const textField = field as ITextAreaFormField<TValues>;
                return (
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
            }
            case 'number': {
                const numberField = field as INumberFormField<TValues>;
                return (
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
            }
            case 'password': {
                const passwordField = field as IPasswordFormField<TValues>;
                return (
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

                return (
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
            }
        }
    }, [field, form, mode, formItemProps, isDisabled, label, name, rulesConfig]);

    if (!withCol) {
        return renderFieldContent();
    }

    return (
        <CustomCol key={String(name)} span={colSpan}>
            {renderFieldContent()}
        </CustomCol>
    );
};
