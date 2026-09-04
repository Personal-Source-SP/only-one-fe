'use client';

import { CustomInputForm, CustomModalForm } from '@/components/common';
import { CustomButton, CustomForm, CustomTooltip } from '@/components/custom-antd';
import type { UseCustomModalFormResponse } from '@/hooks';
import { slugify } from '@/libs';
import { FormRuleType } from '@/utilities';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { DATA_PROVIDER_INITIAL_VALUES, DATA_PROVIDER_LIMITS } from '../constants';
import type { DataProviderFormValues, IDataProvider } from '../types';

type DataProviderFormModalProps = {
    modalForm: UseCustomModalFormResponse<IDataProvider, DataProviderFormValues, IDataProvider>;
};

export const DataProviderFormModal = ({ modalForm }: DataProviderFormModalProps) => {
    const { mode, formProps } = modalForm;

    const name = CustomForm.useWatch('name', formProps.form);
    const isNameEmpty = !name?.trim();

    const handleGenerateIdentifier = useCallback(() => {
        const form = formProps.form;
        if (!form) return;

        const currentName = form.getFieldValue('name');
        if (!currentName) return;

        const generatedIdentifier = slugify(
            currentName,
            DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
        );

        form.setFieldValue('identifier', generatedIdentifier);
        form.validateFields(['identifier']);
    }, [formProps.form]);

    return (
        <CustomModalForm<IDataProvider, DataProviderFormValues, IDataProvider>
            width={600}
            modalForm={modalForm}
            createInitialValues={DATA_PROVIDER_INITIAL_VALUES}
            title={mode === 'create' ? 'Thêm mới nhà cung cấp' : 'Chỉnh sửa nhà cung cấp'}
        >
            <CustomInputForm
                name="name"
                label="Tên nhà cung cấp"
                inputProps={{ placeholder: 'Nhập tên nhà cung cấp' }}
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên nhà cung cấp' },
                    {
                        max: DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH,
                        type: FormRuleType.Max,
                        message: `Tên nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.NAME_MAX_LENGTH} ký tự`,
                    },
                ]}
            />

            <CustomInputForm
                name="identifier"
                label="Mã nhà cung cấp"
                inputProps={{
                    disabled: mode === 'edit',
                    placeholder: 'Nhập mã nhà cung cấp',
                    addonAfter:
                        mode === 'create' ? (
                            <CustomTooltip
                                title={
                                    isNameEmpty
                                        ? 'Vui lòng nhập tên nhà cung cấp trước'
                                        : 'Tự động sinh mã từ tên'
                                }
                            >
                                <span className="inline-block">
                                    <CustomButton
                                        type="text"
                                        size="small"
                                        disabled={isNameEmpty}
                                        onClick={handleGenerateIdentifier}
                                        className="flex items-center gap-1 font-medium text-hub-primary"
                                    >
                                        <ThunderboltOutlined />
                                        Tự động sinh
                                    </CustomButton>
                                </span>
                            </CustomTooltip>
                        ) : undefined,
                }}
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập mã nhà cung cấp' },
                    {
                        type: FormRuleType.Max,
                        max: DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH,
                        message: `Mã nhà cung cấp không được vượt quá ${DATA_PROVIDER_LIMITS.IDENTIFIER_MAX_LENGTH} ký tự`,
                    },
                    {
                        type: FormRuleType.Custom,
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (!/^[a-z0-9-]+$/.test(value)) {
                                return Promise.reject(
                                    'Mã nhà cung cấp chỉ được chứa chữ cái thường, số và dấu gạch ngang',
                                );
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            />

            <CustomInputForm
                name="baseUrl"
                label="URL cơ sở"
                inputProps={{ placeholder: 'https://example.com' }}
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập URL cơ sở' },
                    {
                        type: FormRuleType.Custom,
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            if (!/^.*[^/]$/.test(value)) {
                                return Promise.reject('URL cơ sở không được kết thúc bằng /');
                            }
                            if (!/^(?!.*www\.).*$/.test(value)) {
                                return Promise.reject('URL cơ sở không được chứa www');
                            }
                            return Promise.resolve();
                        },
                    },
                ]}
            />
        </CustomModalForm>
    );
};
