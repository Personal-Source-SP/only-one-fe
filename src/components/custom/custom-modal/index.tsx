'use client';

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
            width: isMobile ? 'calc(100vw - 32px)' : (modalProps.width ?? 1200),
            wrapClassName: [
                'fixed-modal',
                '[&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-hub-border [&_.ant-modal-header]:!pb-3 [&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-3 [&_.ant-modal-footer]:border-t [&_.ant-modal-footer]:border-hub-border',
                isMobile ? '[&_.ant-modal]:!max-w-[calc(100vw-32px)]' : '',
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
            <section className="!max-h-[calc(100vh-200px)] !overflow-y-auto px-4 py-3 md:px-5 md:py-4">
                {children}
            </section>
        </Modal>
    );
};
