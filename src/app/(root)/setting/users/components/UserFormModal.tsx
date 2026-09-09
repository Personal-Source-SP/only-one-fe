'use client';

import { CustomInputForm, CustomModalForm, CustomSwitchForm } from '@/components/common';
import type { UseCustomModalFormResponse } from '@/hooks';
import { FormRuleType } from '@/utilities';
import type { UserFormValues, UserRecord } from '@/app/(root)/setting/users/types';

interface UserFormModalProps {
    modalForm: UseCustomModalFormResponse<UserRecord, UserFormValues, UserRecord>;
}

export const UserFormModal = ({ modalForm }: UserFormModalProps) => {
    const { mode } = modalForm;

    return (
        <CustomModalForm<UserRecord, UserFormValues, UserRecord>
            modalForm={modalForm}
            width={600}
            title={mode === 'create' ? 'Thêm mới người dùng' : 'Chỉnh sửa người dùng'}
            createInitialValues={{
                userName: '',
                email: '',
                isActive: true,
            }}
        >
            <CustomInputForm
                name="userName"
                label="Tên người dùng"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên người dùng' },
                ]}
                inputProps={{ placeholder: 'Nhập tên người dùng' }}
            />

            <CustomInputForm
                name="email"
                label="Email"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập email' },
                    { type: FormRuleType.Email, message: 'Email không đúng định dạng' },
                ]}
                inputProps={{ placeholder: 'Nhập email', disabled: mode === 'edit' }}
            />

            <CustomSwitchForm name="isActive" label="Trạng thái kích hoạt" />
        </CustomModalForm>
    );
};
