'use client';

import {
    CustomInputForm,
    CustomModalForm,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
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

            <div className="flex flex-col gap-1 mt-2">
                <CustomSwitchForm
                    name="autoProcessScraping"
                    label="Tự động cào dữ liệu"
                    description="Tự động lên lịch cào dữ liệu định kỳ từ nhà cung cấp"
                />
                <CustomSwitchForm
                    name="checkDuplicateData"
                    label="Kiểm tra dữ liệu trùng lặp"
                    description="Kiểm tra và loại bỏ dữ liệu trùng lặp trước khi lưu"
                />
                <CustomSwitchForm
                    name="isSavedToCloudData"
                    label="Lưu vào kho dữ liệu"
                    description="Tự động đồng bộ dữ liệu đã cào vào kho dữ liệu cloud"
                />
            </div>
        </CustomModalForm>
    );
};
