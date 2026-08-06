'use client';

import { CustomModalForm, CustomSelectInput, CustomUpload } from '@/components/custom-form';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type { CloudItemFormValues, CloudItemRecord } from '@/app/(root)/cloud-data/items/types';

interface CloudItemFormModalProps {
    modalForm: UseCustomModalFormResponse<CloudItemRecord, CloudItemFormValues, CloudItemRecord>;
    cloudDataProviderOptions?: { label: string; value: string }[];
}

export const CloudItemFormModal = ({
    modalForm,
    cloudDataProviderOptions = [],
}: CloudItemFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<CloudItemRecord, CloudItemFormValues, CloudItemRecord>
            modalForm={modalForm}
            width={600}
            title={mode === 'create' ? 'Thêm mới dữ liệu đám mây' : 'Chỉnh sửa dữ liệu đám mây'}
            createInitialValues={{
                cloudDataProviderId: '',
                file: undefined,
            }}
        >
            <CustomSelectInput
                name="cloudDataProviderId"
                label="Nhà cung cấp kho dữ liệu"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng chọn nhà cung cấp' },
                ]}
                selectProps={{
                    options: cloudDataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp',
                    allowClear: true,
                }}
            />

            <CustomUpload
                name="file"
                label="Tệp dữ liệu"
                rulesConfig={[{ type: FormRuleType.Required, message: 'Vui lòng chọn file' }]}
                uploadProps={{
                    maxCount: 1,
                    accept: '*/*',
                }}
            />
        </CustomModalForm>
    );
};
