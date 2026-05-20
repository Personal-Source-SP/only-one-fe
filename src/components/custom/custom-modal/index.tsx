'use client';

import {
    CUSTOM_MODAL_BODY_CLASS_NAME,
    CUSTOM_MODAL_MOBILE_WRAP_CLASS_NAME,
    HUB_MODAL_WIDTH,
} from '@/constants';
import { Grid, Modal, ModalProps } from 'antd';
import { ReactNode, useMemo } from 'react';

type CustomModalProps = {
    modalProps: ModalProps;
    children: ReactNode;
};

export const CustomModal = ({ modalProps, children }: CustomModalProps) => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    const mergedModalProps = useMemo(
        () => ({
            ...modalProps,
            centered: isMobile,
            destroyOnHidden: modalProps.destroyOnHidden ?? true,
            forceRender: true,
            closable: modalProps.closable ?? false,
            footer: modalProps.footer ?? false,
            getContainer: modalProps.getContainer ?? false,
            maskClosable: modalProps.maskClosable ?? false,
            style: { top: isMobile ? undefined : 20, ...(modalProps.style ?? {}) },
            width: isMobile ? 'calc(100vw - 32px)' : (modalProps.width ?? HUB_MODAL_WIDTH),
            wrapClassName: [
                'fixed-modal',
                isMobile ? CUSTOM_MODAL_MOBILE_WRAP_CLASS_NAME : '',
                modalProps.wrapClassName,
            ]
                .filter(Boolean)
                .join(' '),
        }),
        [isMobile, modalProps],
    );

    if (!mergedModalProps.open) return null;

    return (
        <Modal {...mergedModalProps}>
            <section className={CUSTOM_MODAL_BODY_CLASS_NAME}>{children}</section>
        </Modal>
    );
};
