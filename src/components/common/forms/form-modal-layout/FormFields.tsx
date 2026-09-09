'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomSelect,
    CustomSpace,
    CustomToggle,
    CustomUpload,
    FormProps,
    UploadFile,
} from '@/components/custom-antd';
import { CodeDisplay } from '@/components/common';
import { FormFieldItem } from '@/interfaces';
import { Icon } from '@iconify/react';
import { ChangeEvent } from 'react';

export const renderFormFields = (formField: FormFieldItem, formProps: FormProps<any>) => {
    let formFieldElement = null;
    const formItemProps: Record<string, any> = {
        name: formField.name,
        rules: formField.rules,
        tooltip: formField.tooltip,
    };

    if (formField.type !== 'switch') {
        formItemProps.label = formField.label;
    }

    switch (formField.type) {
        case 'input': {
            const { placeholder, addonAfter, addonBefore } = formField.inputProps ?? {};
            formFieldElement = (
                <CustomInput
                    addonAfter={addonAfter}
                    addonBefore={addonBefore}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        formField.onChange?.(e.target.value, formProps?.form)
                    }
                />
            );
            break;
        }

        case 'select': {
            const { placeholder, options, allowClear, showSearch } = formField.selectProps ?? {};
            formFieldElement = (
                <CustomSelect
                    options={options ?? []}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    allowClear={allowClear ?? true}
                    showSearch={showSearch ?? true}
                    onChange={(value) => formField.onChange?.(value, formProps?.form)}
                />
            );
            break;
        }

        case 'textarea': {
            const { placeholder, rows } = formField.textareaProps ?? {};
            formFieldElement = (
                <CustomInput.TextArea
                    rows={rows ?? 4}
                    placeholder={placeholder}
                    disabled={formField.disabled ?? false}
                    onClear={() => formField.onChange?.('', formProps?.form)}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        formField.onChange?.(e.target.value, formProps?.form)
                    }
                />
            );
            break;
        }

        case 'switch': {
            formFieldElement = (
                <CustomToggle
                    disabled={formField.disabled ?? false}
                    onChange={(value) => formField.onChange?.(value, formProps?.form)}
                />
            );
            break;
        }

        case 'code-display': {
            formFieldElement = <CodeDisplay code="" {...(formField.codeProps ?? {})} />;
            Object.assign(formItemProps, {
                valuePropName: 'code',
                trigger: 'onCodeChange',
                getValueProps: (value: string) => {
                    if (!value) return { code: '{}' };
                    if (typeof value === 'string') return { code: value };

                    try {
                        return { code: JSON.stringify(value, null, 2) };
                    } catch {
                        return { code: String(value) };
                    }
                },
                getValueFromEvent: (value: string) => {
                    formField.onChange?.(value, formProps?.form);
                    return value ?? '';
                },
            });
            break;
        }

        case 'upload': {
            const { accept, maxCount, multiple } = formField.uploadProps ?? {};
            formFieldElement = (
                <CustomUpload.Dragger
                    accept={accept}
                    maxCount={maxCount ?? 1}
                    beforeUpload={() => false}
                    multiple={multiple ?? false}
                    disabled={formField.disabled ?? false}
                >
                    <CustomSpace size="small" direction="vertical" align="center">
                        <p className="ant-upload-drag-icon">
                            <Icon icon="lucide:upload" style={{ fontSize: '48px' }} />
                        </p>
                        <p className="ant-upload-text font-medium text-lg mt-4">
                            Kéo thả hoặc click để chọn file
                        </p>
                        <p className="ant-upload-hint text-gray-500">
                            {accept ? `Định dạng hỗ trợ: ${accept}` : 'Chọn file để tải lên'}
                        </p>
                    </CustomSpace>
                </CustomUpload.Dragger>
            );
            Object.assign(formItemProps, {
                valuePropName: 'fileList',
                getValueFromEvent: (e: { fileList: UploadFile[] }) => {
                    formField.onChange?.(e.fileList, formProps?.form);
                    return e.fileList;
                },
            });
            break;
        }

        default:
            return <></>;
    }

    return (
        <CustomCol
            span={formField.span ?? 24}
            key={formField.name}
            hidden={formField.hidden ?? false}
        >
            {formField.elementTopRender && formField.elementTopRender}

            {formField.type === 'switch' ? (
                <CustomFlex align="center" justify="space-between">
                    <div>
                        <p className="font-medium !my-0">{formField.label}</p>
                        <p className="text-sm text-gray-500 !my-0">
                            {formField.switchProps?.placeholder}
                        </p>
                    </div>
                    <CustomForm.Item {...formItemProps}>{formFieldElement}</CustomForm.Item>
                </CustomFlex>
            ) : (
                <CustomForm.Item {...formItemProps}>{formFieldElement}</CustomForm.Item>
            )}

            {formField.elementBottomRender && formField.elementBottomRender}
        </CustomCol>
    );
};
