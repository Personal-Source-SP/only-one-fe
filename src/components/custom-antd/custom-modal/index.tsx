'use client';

import { HUB_ANTD_MODAL_WRAP_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
import { useBreakpointStore } from '@/stores';
import { Modal, ModalProps } from 'antd';
import { ReactNode, useMemo } from 'react';

export type CustomModalProps = ModalProps & {
    modalProps?: ModalProps;
    children?: ReactNode;
};

export const CustomModal = ({ modalProps, children, ...restProps }: CustomModalProps) => {
    const isMobile = useBreakpointStore((s) => s.isMobile);

    const mergedProps = modalProps ? { ...modalProps, ...restProps } : restProps;

    const finalModalProps = useMemo(
        () => ({
            ...mergedProps,
            centered: mergedProps.centered ?? isMobile,
            destroyOnHidden: mergedProps.destroyOnHidden ?? true,
            forceRender: true,
            closable: mergedProps.closable ?? false,
            footer: mergedProps.footer ?? false,
            getContainer: mergedProps.getContainer ?? false,
            maskClosable: mergedProps.maskClosable ?? false,
            style: { top: isMobile ? undefined : 20, ...(mergedProps.style ?? {}) },
            width: isMobile ? 'calc(100vw - 32px)' : (mergedProps.width ?? 1200),
            wrapClassName: mergeHubAntdClass(
                'fixed-modal',
                HUB_ANTD_MODAL_WRAP_CLASS,
                '[&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-solid [&_.ant-modal-header]:!border-hub-border [&_.ant-modal-header]:!py-3',
                '[&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-3 [&_.ant-modal-footer]:!border-t [&_.ant-modal-footer]:!border-solid [&_.ant-modal-footer]:!border-hub-border [&_.ant-modal-footer]:!py-3',
                '[&_.ant-modal-body]:!p-0',
                isMobile ? '[&_.ant-modal]:!max-w-[calc(100vw-32px)]' : '',
                mergedProps.wrapClassName,
            ),
        }),
        [isMobile, mergedProps],
    );

    if (!finalModalProps.open) return null;

    return (
        <Modal {...finalModalProps}>
            <section className="!max-h-[calc(100vh-160px)] !overflow-y-auto py-2 md:py-3 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-hub-border/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [scrollbar-width:thin] [scrollbar-color:var(--hub-border)_transparent]">
                {children}
            </section>
        </Modal>
    );
};
