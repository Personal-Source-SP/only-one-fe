'use client';

import { type ReactNode, useCallback, useMemo } from 'react';

import { CustomCol, type FormInstance } from '@/components';
import { CustomCheckboxGroupForm } from '@/components';
import { CustomCodeEditorForm } from '@/components';
import { CustomDatePickerForm } from '@/components';
import { CustomHtmlEditorForm } from '@/components';
import { CustomInputForm, CustomInputFormType } from '@/components';
import { CustomJsonToggleForm } from '@/components';
import { CustomRadioGroupForm } from '@/components';
import { CustomRangePicker } from '@/components';
import { CustomSelectInput } from '@/components';
import { CustomSwitchForm } from '@/components';
import { CustomUploadForm } from '@/components';
import type { FormMode } from '@/hooks';

import { CustomFormListField } from './CustomFormListField';
import type {
    CustomFormFieldProps,
    ICheckboxGroupFormField,
    ICodeEditorFormField,
    ICustomFormField,
    IDatePickerFormField,
    IHtmlEditorFormField,
    IInputFormField,
    IJsonToggleFormField,
    IListFormField,
    INumberFormField,
    IPasswordFormField,
    IRadioGroupFormField,
    IRangePickerFormField,
    ISelectFormField,
    ISwitchFormField,
    ITextAreaFormField,
    IUploadFormField,
} from './types';

export const CustomFormField = <TValues extends object = Record<string, unknown>>({
    mode,
    field,
    withCol = true,
    form,
}: CustomFormFieldProps<TValues>) => {
    const { name, label, rulesConfig, disabled, visible, formItemProps } = field;

    const colSpan = useMemo(() => field.colSpan ?? 24, [field.colSpan]);

    const isDisabled = useMemo(
        () => (typeof disabled === 'function' ? disabled(mode, form) : disabled),
        [disabled, mode, form],
    );

    const isVisible = useMemo(
        () => (typeof visible === 'function' ? visible(mode, form) : visible !== false),
        [visible, mode, form],
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
                        name={name}
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
            case 'range_picker': {
                const rangePickerField = field as IRangePickerFormField<TValues>;
                return (
                    <CustomRangePicker
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        rangePickerProps={{
                            disabled: isDisabled,
                            ...rangePickerField.rangePickerProps,
                        }}
                    />
                );
            }
            case 'date_picker': {
                const datePickerField = field as IDatePickerFormField<TValues>;
                return (
                    <CustomDatePickerForm
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        placeholder={datePickerField.placeholder}
                        pickerProps={datePickerField.pickerProps}
                    />
                );
            }
            case 'upload': {
                const uploadField = field as IUploadFormField<TValues>;
                return (
                    <CustomUploadForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        uploadProps={{
                            disabled: isDisabled,
                            ...uploadField.uploadProps,
                        }}
                    />
                );
            }
            case 'html_editor': {
                const htmlField = field as IHtmlEditorFormField<TValues>;
                return (
                    <CustomHtmlEditorForm
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        rows={htmlField.rows}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        placeholder={htmlField.placeholder}
                        editorProps={htmlField.editorProps}
                    />
                );
            }

            case 'code_editor': {
                const codeField = field as ICodeEditorFormField<TValues>;
                return (
                    <CustomCodeEditorForm
                        form={form}
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        language={codeField.language}
                        maxHeight={codeField.maxHeight}
                        isDisplayLanguage={codeField.isDisplayLanguage}
                    />
                );
            }
            case 'json_toggle': {
                const jsonToggleField = field as IJsonToggleFormField<TValues>;
                return (
                    <CustomJsonToggleForm
                        form={form}
                        name={name}
                        label={label}
                        disabled={isDisabled}
                        icon={jsonToggleField.icon}
                        formItemProps={formItemProps}
                        maxHeight={jsonToggleField.maxHeight}
                        description={jsonToggleField.description}
                        defaultEmptyValue={jsonToggleField.defaultEmptyValue}
                    />
                );
            }
            case 'radio_group': {
                const radioField = field as IRadioGroupFormField<TValues>;
                return (
                    <CustomRadioGroupForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        disabled={isDisabled}
                        options={radioField.options}
                        radioGroupProps={radioField.radioGroupProps}
                    />
                );
            }
            case 'checkbox_group': {
                const checkboxField = field as ICheckboxGroupFormField<TValues>;
                return (
                    <CustomCheckboxGroupForm
                        name={name}
                        label={label}
                        rulesConfig={rulesConfig}
                        formItemProps={formItemProps}
                        disabled={isDisabled}
                        options={checkboxField.options}
                        checkboxGroupProps={checkboxField.checkboxGroupProps}
                    />
                );
            }
            case 'list': {
                const listField = field as IListFormField<TValues>;
                return <CustomFormListField field={listField} form={form} mode={mode} />;
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

    if (!isVisible) {
        return null;
    }

    if (!withCol) {
        return renderFieldContent();
    }

    return (
        <CustomCol key={String(name)} span={colSpan}>
            {renderFieldContent()}
        </CustomCol>
    );
};
