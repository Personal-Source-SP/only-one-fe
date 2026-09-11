'use client';

import { HUB_ANTD_MODAL_WRAP_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
import { CustomSpin } from '@/components/custom-antd/custom-spin';
import { useBreakpointStore } from '@/stores';
import { Modal, ModalProps } from 'antd';
import { CSSProperties, ReactNode, useMemo } from 'react';

export type CustomModalProps = ModalProps & {
    fixed?: boolean;
    isFixed?: boolean;
    loading?: boolean;
    children?: ReactNode;
    loadingTip?: ReactNode;
    bodyClassName?: string;
    modalProps?: ModalProps;
    bodyStyle?: CSSProperties;
    fixedHeight?: number | string;
};

export const CustomModal = ({
    fixed,
    isFixed,
    loading,
    children,
    loadingTip,
    bodyClassName,
    modalProps,
    bodyStyle,
    fixedHeight,
    ...restProps
}: CustomModalProps) => {
    const isSpinning = Boolean(loading);
    const isMobile = useBreakpointStore((s) => s.isMobile);
    const isFixedMode = fixed || isFixed || Boolean(fixedHeight);
    const mergedProps = modalProps ? { ...modalProps, ...restProps } : restProps;

    const finalModalProps = useMemo(
        () => ({
            ...mergedProps,
            forceRender: true,
            footer: mergedProps.footer ?? false,
            centered: mergedProps.centered ?? isMobile,
            getContainer: mergedProps.getContainer ?? false,
            destroyOnHidden: mergedProps.destroyOnHidden ?? true,
            keyboard: isSpinning ? false : (mergedProps.keyboard ?? true),
            closable: isSpinning ? false : (mergedProps.closable ?? false),
            maskClosable: isSpinning ? false : (mergedProps.maskClosable ?? false),
            modalRender:
                mergedProps.modalRender ||
                (isSpinning
                    ? (modalNode: ReactNode) => (
                          <CustomSpin
                              tip={loadingTip}
                              spinning={isSpinning}
                              wrapperClassName="w-full h-full [&_.ant-spin-container]:w-full [&_.ant-spin-container]:h-full"
                          >
                              {modalNode}
                          </CustomSpin>
                      )
                    : undefined),
            style: { top: isMobile ? 10 : 20, ...(mergedProps.style ?? {}) },
            width: isMobile ? 'calc(100vw - 24px)' : (mergedProps.width ?? 1200),
            wrapClassName: mergeHubAntdClass(
                'fixed-modal',
                HUB_ANTD_MODAL_WRAP_CLASS,
                '[&_.ant-modal-content]:!flex [&_.ant-modal-content]:!flex-col [&_.ant-modal-content]:!overflow-hidden',
                isMobile
                    ? '[&_.ant-modal-content]:!max-h-[calc(100vh-32px)] [&_.ant-modal-content]:!p-3'
                    : '[&_.ant-modal-content]:!max-h-[calc(100vh-60px)]',
                isMobile
                    ? '[&_.ant-modal-header]:!shrink-0 [&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-solid [&_.ant-modal-header]:!border-hub-border [&_.ant-modal-header]:!py-2.5 [&_.ant-modal-header]:!px-3'
                    : '[&_.ant-modal-header]:!shrink-0 [&_.ant-modal-header]:!border-b [&_.ant-modal-header]:!border-solid [&_.ant-modal-header]:!border-hub-border [&_.ant-modal-header]:!py-3 [&_.ant-modal-header]:!px-6',
                isMobile
                    ? '[&_.ant-modal-footer]:!shrink-0 [&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-2 [&_.ant-modal-footer]:!border-t [&_.ant-modal-footer]:!border-solid [&_.ant-modal-footer]:!border-hub-border [&_.ant-modal-footer]:!py-2.5 [&_.ant-modal-footer]:!px-3'
                    : '[&_.ant-modal-footer]:!shrink-0 [&_.ant-modal-footer]:flex [&_.ant-modal-footer]:justify-end [&_.ant-modal-footer]:gap-3 [&_.ant-modal-footer]:!border-t [&_.ant-modal-footer]:!border-solid [&_.ant-modal-footer]:!border-hub-border [&_.ant-modal-footer]:!py-3 [&_.ant-modal-footer]:!px-6',
                '[&_.ant-modal-body]:!flex-1 [&_.ant-modal-body]:!min-h-0 [&_.ant-modal-body]:!overflow-y-auto [&_.ant-modal-body]:!p-0 [&_.ant-modal-body::-webkit-scrollbar]:w-1.5 [&_.ant-modal-body::-webkit-scrollbar-thumb]:bg-hub-border/60 [&_.ant-modal-body::-webkit-scrollbar-thumb]:rounded-full [&_.ant-modal-body::-webkit-scrollbar-track]:bg-transparent',
                isMobile ? '[&_.ant-modal]:!max-w-[calc(100vw-24px)] [&_.ant-modal]:!my-2' : '',
                mergedProps.wrapClassName,
            ),
        }),
        [isMobile, isSpinning, mergedProps, loadingTip],
    );

    const sectionStyle = useMemo<CSSProperties>(() => {
        if (fixedHeight) {
            const heightVal = typeof fixedHeight === 'number' ? `${fixedHeight}px` : fixedHeight;
            return { height: heightVal, maxHeight: heightVal, ...bodyStyle };
        }

        if (isFixedMode) {
            return {
                height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 180px)',
                ...bodyStyle,
            };
        }

        return bodyStyle ?? {};
    }, [fixedHeight, bodyStyle, isFixedMode, isMobile]);

    if (!finalModalProps.open) return null;

    return (
        <Modal {...finalModalProps}>
            <section
                style={sectionStyle}
                className={mergeHubAntdClass(
                    isMobile ? 'w-full p-2' : 'w-full p-3.5',
                    bodyClassName,
                )}
            >
                {children}
            </section>
        </Modal>
    );
};
