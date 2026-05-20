'use client';

import { CustomModal } from '@/components/custom';
import { ModalProps, Space, Spin } from 'antd';
import { ReactNode } from 'react';

type FormModalLayoutProps = {
    formLoading: boolean;
    modalProps: ModalProps;
    children: ReactNode;
};

export const FormModalLayout = ({ formLoading, modalProps, children }: FormModalLayoutProps) => {
    return (
        <CustomModal modalProps={{ ...modalProps, destroyOnHidden: true }}>
            <Spin spinning={formLoading}>
                <Space
                    direction="vertical"
                    className="h-full w-full overflow-x-hidden px-3 md:px-6"
                >
                    {children}
                </Space>
            </Spin>
        </CustomModal>
    );
};
