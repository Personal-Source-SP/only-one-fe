'use client';

import {
    CustomInputForm,
    CustomModalForm,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
import type { UseCustomModalFormResponse, useSelectDataProvider } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    ProviderItemFormValues,
    ProviderItemRecord,
} from '@/app/(root)/scraping/provider-items/types';
import type { IDataProvider } from '../../data-providers/types';
import type { Option } from '@/interfaces';

type ProviderItemFormModalProps = {
    modalForm: UseCustomModalFormResponse<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >;
    itemOptions?: Option[];
    dataProviderOptions?: Option[];
    cloudDataProviderOptions?: Option[];
    dataProviderQuery?: ReturnType<typeof useSelectDataProvider>['query'];
};

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
            width={640}
            modalForm={modalForm}
            title={
                mode === 'create'
                    ? 'Thêm mới đối tượng nhà cung cấp'
                    : 'Chỉnh sửa đối tượng nhà cung cấp'
            }
            createInitialValues={{
                itemId: '',
                itemUrl: '',
                dataProviderId: '',
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
                    allowClear: true,
                    options: itemOptions,
                    placeholder: 'Chọn đối tượng',
                }}
            />

            <CustomSelectInput
                name="dataProviderId"
                label="Tên nhà cung cấp"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng chọn nhà cung cấp' },
                ]}
                selectProps={{
                    allowClear: true,
                    options: dataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp',
                    onChange: (value) => {
                        const dataProvider = dataProviderQuery?.data?.data?.find(
                            (option: IDataProvider) => option.id === value,
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
                inputProps={{ placeholder: 'Nhập URL đối tượng' }}
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập URL đối tượng' },
                ]}
            />

            <CustomSelectInput
                name="cloudDataProviderId"
                label="Nhà cung cấp kho dữ liệu"
                selectProps={{
                    allowClear: true,
                    options: cloudDataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp kho dữ liệu (nếu có)',
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
