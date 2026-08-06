'use client';

import { CustomRow } from '@/components/custom';
import {
    CustomInputForm,
    CustomModalForm,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/custom-form';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    ProviderItemFormValues,
    ProviderItemRecord,
} from '@/app/(root)/scraping/provider-items/types';

interface ProviderItemFormModalProps {
    modalForm: UseCustomModalFormResponse<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >;
    itemOptions?: { label: string; value: string }[];
    dataProviderOptions?: { label: string; value: string }[];
    cloudDataProviderOptions?: { label: string; value: string }[];
    dataProviderQuery?: any;
}

export const ProviderItemFormModal = ({
    modalForm,
    itemOptions = [],
    dataProviderOptions = [],
    cloudDataProviderOptions = [],
    dataProviderQuery,
}: ProviderItemFormModalProps) => {
    const { mode, formProps } = modalForm;

    return (
        <CustomModalForm<ProviderItemRecord, ProviderItemFormValues, ProviderItemRecord>
            modalForm={modalForm}
            width={640}
            title={
                mode === 'create'
                    ? 'Thêm mới đối tượng nhà cung cấp'
                    : 'Chỉnh sửa đối tượng nhà cung cấp'
            }
            createInitialValues={{
                itemId: '',
                dataProviderId: '',
                itemUrl: '',
                cloudDataProviderId: undefined,
                autoProcessScraping: true,
                checkDuplicateData: true,
                isSavedToCloudData: false,
            }}
        >
            <CustomSelectInput
                name="itemId"
                label="Tên đối tượng"
                rulesConfig={[{ type: FormRuleType.Required, message: 'Vui lòng chọn đối tượng' }]}
                selectProps={{
                    options: itemOptions,
                    placeholder: 'Chọn đối tượng',
                    allowClear: true,
                }}
            />

            <CustomSelectInput
                name="dataProviderId"
                label="Tên nhà cung cấp"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng chọn nhà cung cấp' },
                ]}
                selectProps={{
                    options: dataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp',
                    allowClear: true,
                    onChange: (value) => {
                        const dataProvider = dataProviderQuery?.data?.data?.find(
                            (option: any) => option.id === value,
                        );
                        if (dataProvider?.baseUrl) {
                            formProps.form?.setFieldValue('itemUrl', dataProvider.baseUrl);
                        }
                    },
                }}
            />

            <CustomInputForm
                name="itemUrl"
                label="URL cơ sở"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập URL đối tượng' },
                ]}
                inputProps={{ placeholder: 'Nhập URL đối tượng' }}
            />

            <CustomSelectInput
                name="cloudDataProviderId"
                label="Nhà cung cấp kho dữ liệu"
                selectProps={{
                    options: cloudDataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp kho dữ liệu (nếu có)',
                    allowClear: true,
                }}
            />

            <CustomRow gutter={16} className="mt-2">
                <CustomSwitchForm name="autoProcessScraping" label="Tự động cào dữ liệu" />
                <CustomSwitchForm name="checkDuplicateData" label="Kiểm tra dữ liệu trùng lặp" />
                <CustomSwitchForm name="isSavedToCloudData" label="Lưu vào kho dữ liệu" />
            </CustomRow>
        </CustomModalForm>
    );
};
