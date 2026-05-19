'use client';

import CustomModal from '@/components/custom/custom-modal';

import { ModalProps, Space, Spin } from 'antd';
import { ReactNode } from 'react';

type CustomFormModalProps = {
    formLoading: boolean;
    modalProps: ModalProps;
    children: ReactNode;
};

const CustomFormModal = ({ formLoading, modalProps, children }: CustomFormModalProps) => {
    return (
        <CustomModal modalProps={{ ...modalProps, destroyOnHidden: true }}>
            <Spin spinning={formLoading}>
                <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                    {children}
                </Space>
            </Spin>
        </CustomModal>
    );
};

export default CustomFormModal;
