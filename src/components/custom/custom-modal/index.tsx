'use client';

import { useBreakpointStore } from '@/stores';
import { Modal, ModalProps } from 'antd';
import { ReactNode, useMemo } from 'react';

export type CustomModalProps = {
    modalProps: ModalProps;
    children: ReactNode;
};

export const CustomModal = ({ modalProps, children }: CustomModalProps) => {
    const isMobile = useBreakpointStore((s) => s.isMobile);

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
                '[&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-solid [&_.ant-modal-header]:!border-hub-border [&_.ant-modal-header]:!py-3',
                '[&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-3 [&_.ant-modal-footer]:!border-t [&_.ant-modal-footer]:!border-solid [&_.ant-modal-footer]:!border-hub-border [&_.ant-modal-footer]:!py-3',
                '[&_.ant-modal-body]:!p-0',
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
            <section className="!max-h-[calc(100vh-200px)] !overflow-y-auto py-2 md:py-3">
                {children}
            </section>
        </Modal>
    );
};
