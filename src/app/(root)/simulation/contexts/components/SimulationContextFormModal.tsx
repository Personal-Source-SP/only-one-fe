'use client';

import { CustomInputForm, CustomModalForm } from '@/components/custom-form';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    SimulationContextFormValues,
    SimulationContextRecord,
} from '@/app/(root)/simulation/contexts/types';

interface SimulationContextFormModalProps {
    modalForm: UseCustomModalFormResponse<
        SimulationContextRecord,
        SimulationContextFormValues,
        SimulationContextRecord
    >;
}

export const SimulationContextFormModal = ({ modalForm }: SimulationContextFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<
            SimulationContextRecord,
            SimulationContextFormValues,
            SimulationContextRecord
        >
            modalForm={modalForm}
            width={600}
            title={mode === 'create' ? 'Thêm mới ngữ cảnh mô phỏng' : 'Chỉnh sửa ngữ cảnh mô phỏng'}
            createInitialValues={{
                name: '',
                description: '',
                defaultPayload: JSON.stringify({}, null, 2),
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên ngữ cảnh"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên ngữ cảnh' },
                ]}
                inputProps={{ placeholder: 'Nhập tên ngữ cảnh' }}
            />

            <CustomInputForm
                name="description"
                label="Mô tả"
                inputProps={{ placeholder: 'Nhập mô tả ngữ cảnh' }}
            />

            <CustomInputForm
                name="defaultPayload"
                label="Payload mặc định (JSON)"
                inputProps={{ placeholder: '{}' }}
            />
        </CustomModalForm>
    );
};
