'use client';

import { CustomInputForm, CustomModalForm, CustomSelectInput } from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type {
    SimulationItemFormValues,
    SimulationItemRecord,
} from '@/app/(root)/simulation/items/types';

interface SimulationItemFormModalProps {
    modalForm: UseCustomModalFormResponse<
        SimulationItemRecord,
        SimulationItemFormValues,
        SimulationItemRecord
    >;
    simulationContextOptions?: { label: string; value: string }[];
}

export const SimulationItemFormModal = ({
    modalForm,
    simulationContextOptions = [],
}: SimulationItemFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<SimulationItemRecord, SimulationItemFormValues, SimulationItemRecord>
            modalForm={modalForm}
            width={600}
            title={mode === 'create' ? 'Thêm mới mô phỏng' : 'Chỉnh sửa mô phỏng'}
            createInitialValues={{
                name: '',
                simulationContextId: '',
                payload: JSON.stringify({}, null, 2),
            }}
        >
            <CustomInputForm
                name="name"
                label="Tên đối tượng mô phỏng"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên đối tượng' },
                ]}
                inputProps={{ placeholder: 'Nhập tên đối tượng mô phỏng' }}
            />

            <CustomSelectInput
                name="simulationContextId"
                label="Ngữ cảnh mô phỏng"
                rulesConfig={[{ type: FormRuleType.Required, message: 'Vui lòng chọn ngữ cảnh' }]}
                selectProps={{
                    options: simulationContextOptions,
                    placeholder: 'Chọn ngữ cảnh',
                    allowClear: true,
                }}
            />

            <CustomInputForm
                name="payload"
                label="Payload (JSON)"
                inputProps={{ placeholder: '{}' }}
            />
        </CustomModalForm>
    );
};
