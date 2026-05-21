'use client';

import { CustomModal, CustomSpace, CustomSpin, ModalProps } from '@/components/custom';
import { ReactNode } from 'react';

type FormModalLayoutProps = {
    formLoading: boolean;
    modalProps: ModalProps;
    children: ReactNode;
};

export const FormModalLayout = ({ formLoading, modalProps, children }: FormModalLayoutProps) => {
    return (
        <CustomModal modalProps={{ ...modalProps, destroyOnHidden: true }}>
            <CustomSpin spinning={formLoading}>
                <CustomSpace direction="vertical" className="h-full w-full overflow-x-hidden">
                    {children}
                </CustomSpace>
            </CustomSpin>
        </CustomModal>
    );
};
