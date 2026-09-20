'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { CustomButton, CustomFlex, CustomModal, CustomSkeleton } from '@/components';
import { CustomDetailSection } from '@/components/';

import type { DetailModalContainerProps } from './types';

export const DetailModalContainer = <TRecord extends object = Record<string, unknown>>({
    detailModal,
    title,
    closeText = 'Đóng',
    width = 750,
    sections,
    children,
    extraActions,
}: DetailModalContainerProps<TRecord>) => {
    const { open, close, data, isLoading } = detailModal;

    const modalFooter = useMemo(() => {
        const resolvedExtra: ReactNode =
            typeof extraActions === 'function'
                ? data
                    ? extraActions(data, close)
                    : null
                : extraActions;

        return (
            <CustomFlex justify="end" align="center" gap="small" className="w-full">
                <CustomButton key="close" onClick={close}>
                    {closeText}
                </CustomButton>
                {resolvedExtra}
            </CustomFlex>
        );
    }, [data, extraActions, closeText, close]);

    const content = useMemo(() => {
        if (isLoading) {
            return <CustomSkeleton active paragraph={{ rows: 6 }} />;
        }

        if (!data) return null;

        if (sections?.length) {
            return <CustomDetailSection sections={sections} record={data} />;
        }

        if (typeof children === 'function') {
            return children(data);
        }

        return children;
    }, [isLoading, data, sections, children]);

    return (
        <CustomModal
            open={open}
            width={width}
            title={title}
            onCancel={close}
            loading={isLoading}
            footer={modalFooter}
            bodyClassName="p-4"
        >
            {content}
        </CustomModal>
    );
};
