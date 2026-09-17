'use client';

import React from 'react';
import { CustomInputForm, CustomModalForm, CustomSelectInput } from '@/components/common';
import { FormRuleType } from '@/utilities';

import { FieldsEnum } from '@/app/(root)/google/drive/folders/constants';
import type {
    FolderFormValues,
    FolderModalProps,
    GoogleFolderRecord,
} from '@/app/(root)/google/drive/folders/types';

export const FolderModal = ({ folderOptions, modalForm }: FolderModalProps) => {
    const { formProps } = modalForm;
    const currentId = formProps.initialValues?.id;

    return (
        <CustomModalForm<GoogleFolderRecord, FolderFormValues, GoogleFolderRecord>
            modalForm={modalForm}
            width={600}
            title="Chỉnh sửa thư mục"
            createInitialValues={{
                [FieldsEnum.Name]: '',
                [FieldsEnum.ParentFolderId]: undefined,
            }}
        >
            <CustomInputForm
                name={FieldsEnum.Name}
                label="Tên thư mục"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng nhập tên thư mục' },
                ]}
                inputProps={{ placeholder: 'Tên thư mục' }}
            />

            <CustomSelectInput
                name={FieldsEnum.ParentFolderId}
                label="Thư mục cha"
                selectProps={{
                    showSearch: true,
                    placeholder: 'Thư mục cha',
                    options: folderOptions?.filter((item) => item.value !== currentId),
                    filterOption: (input, option) =>
                        String(option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase()),
                }}
            />
        </CustomModalForm>
    );
};
