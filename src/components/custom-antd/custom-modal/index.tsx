'use client';

import { HUB_ANTD_MODAL_WRAP_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
import { useBreakpointStore } from '@/stores';
import { Modal, ModalProps } from 'antd';
import { CSSProperties, ReactNode, useMemo } from 'react';

export type CustomModalProps = ModalProps & {
    modalProps?: ModalProps;
    children?: ReactNode;
    fixed?: boolean;
    isFixed?: boolean;
    fixedHeight?: number | string;
    bodyClassName?: string;
    bodyStyle?: CSSProperties;
};

export const CustomModal = ({
    modalProps,
    children,
    fixed,
    isFixed,
    fixedHeight,
    bodyClassName,
    bodyStyle,
    ...restProps
}: CustomModalProps) => {
    const isMobile = useBreakpointStore((s) => s.isMobile);
    const isFixedMode = fixed || isFixed || Boolean(fixedHeight);
    const mergedProps = modalProps ? { ...modalProps, ...restProps } : restProps;

    const finalModalProps = useMemo(
        () => ({
            ...mergedProps,
            forceRender: true,
            footer: mergedProps.footer ?? false,
            closable: mergedProps.closable ?? false,
            centered: mergedProps.centered ?? isMobile,
            getContainer: mergedProps.getContainer ?? false,
            maskClosable: mergedProps.maskClosable ?? false,
            destroyOnHidden: mergedProps.destroyOnHidden ?? true,
            style: { top: isMobile ? undefined : 20, ...(mergedProps.style ?? {}) },
            width: isMobile ? 'calc(100vw - 32px)' : (mergedProps.width ?? 1200),
            wrapClassName: mergeHubAntdClass(
                'fixed-modal',
                HUB_ANTD_MODAL_WRAP_CLASS,
                '[&_.ant-modal-content]:!flex [&_.ant-modal-content]:!flex-col [&_.ant-modal-content]:!max-h-[calc(100vh-60px)] [&_.ant-modal-content]:!overflow-hidden',
                '[&_.ant-modal-header]:!shrink-0 [&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-solid [&_.ant-modal-header]:!border-hub-border [&_.ant-modal-header]:!py-3 [&_.ant-modal-header]:!px-6',
                '[&_.ant-modal-footer]:!shrink-0 [&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-3 [&_.ant-modal-footer]:!border-t [&_.ant-modal-footer]:!border-solid [&_.ant-modal-footer]:!border-hub-border [&_.ant-modal-footer]:!py-3 [&_.ant-modal-footer]:!px-6',
                '[&_.ant-modal-body]:!flex-1 [&_.ant-modal-body]:!min-h-0 [&_.ant-modal-body]:!overflow-y-auto [&_.ant-modal-body]:!p-0 [&_.ant-modal-body::-webkit-scrollbar]:w-1.5 [&_.ant-modal-body::-webkit-scrollbar-thumb]:bg-hub-border/60 [&_.ant-modal-body::-webkit-scrollbar-thumb]:rounded-full [&_.ant-modal-body::-webkit-scrollbar-track]:bg-transparent',
                isMobile ? '[&_.ant-modal]:!max-w-[calc(100vw-32px)]' : '',
                mergedProps.wrapClassName,
            ),
        }),
        [isMobile, mergedProps],
    );

    const sectionStyle = useMemo<CSSProperties>(() => {
        if (fixedHeight) {
            const heightVal = typeof fixedHeight === 'number' ? `${fixedHeight}px` : fixedHeight;
            return {
                height: heightVal,
                maxHeight: heightVal,
                ...bodyStyle,
            };
        }

        if (isFixedMode) {
            return {
                height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 180px)',
                ...bodyStyle,
            };
        }

        return bodyStyle ?? {};
    }, [fixedHeight, isFixedMode, isMobile, bodyStyle]);

    if (!finalModalProps.open) return null;

    return (
        <Modal {...finalModalProps}>
            <section
                style={sectionStyle}
                className={mergeHubAntdClass('w-full p-3', bodyClassName)}
            >
                {children}
            </section>
        </Modal>
    );
};
