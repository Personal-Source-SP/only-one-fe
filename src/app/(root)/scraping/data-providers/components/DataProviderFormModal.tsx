'use client';

import { CustomInputForm, CustomModalForm, CustomSelectInput } from '@/components/custom-form';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    DataProviderFormValues,
    DataProviderRecord,
} from '@/app/(root)/scraping/data-providers/types';

interface DataProviderFormModalProps {
    modalForm: UseCustomModalFormResponse<
        DataProviderRecord,
        DataProviderFormValues,
        DataProviderRecord
    >;
    parentOptions?: { label: string; value: string }[];
}

export const DataProviderFormModal = ({
    modalForm,
    parentOptions = [],
}: DataProviderFormModalProps) => {
    const { mode, formProps } = modalForm;

    return (
        <CustomModalForm<DataProviderRecord, DataProviderFormValues, DataProviderRecord>
            modalForm={modalForm}
            width={600}
            title={mode === 'create' ? 'Thêm mới nhà cung cấp' : 'Chỉnh sửa nhà cung cấp'}
            createInitialValues={{
                name: '',
                identifier: '',
                baseUrl: '',
                parentId: undefined,
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên nhà cung cấp"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên nhà cung cấp' },
                    {
                        type: FormRuleType.Max,
                        max: 255,
                        message: 'Tên nhà cung cấp không được vượt quá 255 ký tự',
                    },
                ]}
                inputProps={{ placeholder: 'Nhập tên nhà cung cấp' }}
            />

            <CustomInputForm
                name="identifier"
                label="Mã nhà cung cấp"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập mã nhà cung cấp' },
                    {
                        type: FormRuleType.Max,
                        max: 20,
                        message: 'Mã nhà cung cấp không được vượt quá 20 ký tự',
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
                inputProps={{
                    placeholder: 'Nhập mã nhà cung cấp (vd: shopee)',
                    disabled: mode === 'edit',
                }}
            />

            <CustomInputForm
                name="baseUrl"
                label="URL cơ sở"
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
                inputProps={{ placeholder: 'https://shopee.vn' }}
            />

            {parentOptions.length > 0 && (
                <CustomSelectInput
                    name="parentId"
                    label="Nhà cung cấp cha"
                    selectProps={{
                        options: parentOptions,
                        placeholder: 'Chọn nhà cung cấp cha (nếu có)',
                        allowClear: true,
                        onChange: (value) => {
                            const selectedParent = parentOptions.find((opt) => opt.value === value);
                            if (selectedParent) {
                                formProps.form?.setFieldValue('identifier', selectedParent.label);
                            }
                        },
                    }}
                />
            )}
        </CustomModalForm>
    );
};
