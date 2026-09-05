'use client';

import {
    CustomInputForm,
    CustomModalForm,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import { enumToOptions } from '@/libs';
import { FormRuleType } from '@/utilities';

import { CloudDataProviderType } from '../enums';
import type { CloudProviderFormValues, CloudProviderRecord } from '../types';

interface CloudProviderFormModalProps {
    modalForm: UseCustomModalFormResponse<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >;
}

export const CloudProviderFormModal = ({ modalForm }: CloudProviderFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<CloudProviderRecord, CloudProviderFormValues, CloudProviderRecord>
            modalForm={modalForm}
            width={600}
            title={
                mode === 'create' ? 'Thêm mới nhà cung cấp cloud' : 'Chỉnh sửa nhà cung cấp cloud'
            }
            createInitialValues={{
                name: '',
                type: CloudDataProviderType.TELEGRAM,
                config: JSON.stringify({ channelId: '' }, null, 2),
                isActive: true,
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên nhà cung cấp"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên nhà cung cấp' },
                ]}
                inputProps={{ placeholder: 'Nhập tên nhà cung cấp' }}
            />

            <CustomSelectInput
                name="type"
                label="Loại"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng chọn loại nhà cung cấp' },
                ]}
                selectProps={{
                    options: enumToOptions(CloudDataProviderType) ?? [],
                    placeholder: 'Chọn loại',
                    disabled: mode === 'edit',
                }}
            />

            <CustomInputForm
                name="config"
                label="Cấu hình (JSON)"
                inputProps={{
                    placeholder: '{"channelId": ""}',
                }}
            />

            <CustomSwitchForm name="isActive" label="Trạng thái" />
        </CustomModalForm>
    );
};
