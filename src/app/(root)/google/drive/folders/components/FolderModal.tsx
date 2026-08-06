import React from 'react';
import {
    CustomButton,
    CustomCol,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomRow,
    CustomSelect,
    CustomSpace,
    CustomSpin,
} from '@/components/custom';
import { Icon } from '@iconify/react';

import { FieldsEnum } from '@/app/(root)/google/drive/folders/constants';
import { FolderModalProps } from '@/app/(root)/google/drive/folders/types';

export const FolderModal = ({
    folderOptions,
    modalPropsData,
    onSubmit,
    onClose,
}: FolderModalProps) => {
    const { open, modalProps, formProps, formLoading, close } = modalPropsData;

    return (
        <CustomModal
            modalProps={{
                ...modalProps,
                open,
                width: 720,
                centered: true,
                closable: true,
                title: 'Chỉnh sửa thư mục',
                onCancel: onClose ?? close,
            }}
        >
            <CustomSpin spinning={formLoading}>
                <CustomSpace direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                    <CustomForm
                        {...formProps}
                        layout="vertical"
                        onFinish={onSubmit}
                        className="[&_.ant-form-item]:!mb-2"
                    >
                        <CustomRow gutter={[16, 8]}>
                            <CustomCol span={24}>
                                <CustomForm.Item
                                    label="Tên thư mục"
                                    name={FieldsEnum.Name}
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên thư mục' },
                                    ]}
                                >
                                    <CustomInput placeholder="Tên thư mục" />
                                </CustomForm.Item>
                            </CustomCol>
                            <CustomCol span={24}>
                                <CustomForm.Item label="Thư mục" name={FieldsEnum.ParentFolderId}>
                                    <CustomSelect
                                        allowClear
                                        showSearch
                                        placeholder="Thư mục cha"
                                        options={folderOptions?.filter(
                                            (item) => item.value !== formProps.initialValues?.id,
                                        )}
                                        filterOption={(input, option) =>
                                            String(option?.label ?? '')
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    />
                                </CustomForm.Item>
                            </CustomCol>

                            <CustomButton
                                type="primary"
                                htmlType="submit"
                                className="w-full"
                                icon={<Icon icon="lucide:x" />}
                            >
                                <span>Chỉnh sửa</span>
                            </CustomButton>
                        </CustomRow>
                    </CustomForm>
                </CustomSpace>
            </CustomSpin>
        </CustomModal>
    );
};
