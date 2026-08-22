'use client';

import { CustomInputForm, CustomModalForm } from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    DataProviderFormValues,
    IDataProvider,
} from '@/app/(root)/scraping/data-providers/types';

type DataProviderFormModalProps = {
    modalForm: UseCustomModalFormResponse<IDataProvider, DataProviderFormValues, IDataProvider>;
};

export const DataProviderFormModal = ({ modalForm }: DataProviderFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<IDataProvider, DataProviderFormValues, IDataProvider>
            width={600}
            modalForm={modalForm}
            title={mode === 'create' ? 'Thêm mới nhà cung cấp' : 'Chỉnh sửa nhà cung cấp'}
            createInitialValues={{
                name: '',
                identifier: '',
                baseUrl: '',
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
        </CustomModalForm>
    );
};
