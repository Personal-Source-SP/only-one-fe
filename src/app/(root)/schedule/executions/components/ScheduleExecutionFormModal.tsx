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
    ScheduleExecutionFormValues,
    ScheduleExecutionRecord,
} from '@/app/(root)/schedule/executions/types';

interface ScheduleExecutionFormModalProps {
    modalForm: UseCustomModalFormResponse<
        ScheduleExecutionRecord,
        ScheduleExecutionFormValues,
        ScheduleExecutionRecord
    >;
    itemOptions?: { label: string; value: string }[];
    dataProviderOptions?: { label: string; value: string }[];
}

export const ScheduleExecutionFormModal = ({
    modalForm,
    itemOptions = [],
    dataProviderOptions = [],
}: ScheduleExecutionFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<
            ScheduleExecutionRecord,
            ScheduleExecutionFormValues,
            ScheduleExecutionRecord
        >
            modalForm={modalForm}
            width={600}
            title={
                mode === 'create' ? 'Thêm mới lịch biểu thực thi' : 'Chỉnh sửa lịch biểu thực thi'
            }
            createInitialValues={{
                name: '',
                type: '',
                cronExpression: '',
                dataProviderId: undefined,
                itemId: undefined,
                isActive: true,
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên lịch biểu"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên lịch biểu' },
                ]}
                inputProps={{ placeholder: 'Nhập tên lịch biểu' }}
            />

            <CustomInputForm
                name="cronExpression"
                label="Biểu thức Cron"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập biểu thức Cron' },
                ]}
                inputProps={{ placeholder: 'Ví dụ: 0 0 * * *' }}
            />

            <CustomSelectInput
                name="dataProviderId"
                label="Nhà cung cấp (nếu có)"
                selectProps={{
                    options: dataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp',
                    allowClear: true,
                }}
            />

            <CustomSelectInput
                name="itemId"
                label="Đối tượng (nếu có)"
                selectProps={{
                    options: itemOptions,
                    placeholder: 'Chọn đối tượng',
                    allowClear: true,
                }}
            />

            <CustomSwitchForm name="isActive" label="Trạng thái hoạt động" />
        </CustomModalForm>
    );
};
