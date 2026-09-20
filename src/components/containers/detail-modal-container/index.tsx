'use client';

import { CustomDetailSection } from '@/components/';
import { CustomButton, CustomFlex, CustomModal } from '@/components';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { DetailModalContainerProps } from './types';

export const DetailModalContainer = <TRecord extends object = Record<string, unknown>>({
    open,
    onClose,
    data,
    loading = false,
    title,
    icon,
    badge,
    width = 750,
    closeText = 'Đóng',
    extraActions,
    footer,
    sections,
    children,
    className = '',
    bodyClassName = '',
}: DetailModalContainerProps<TRecord>) => {
    const modalTitle = useMemo(() => {
        if (!title && !icon) return undefined;
        return (
            <CustomFlex align="center" gap="small">
                {typeof icon === 'string' ? <Icon icon={icon} width={22} height={22} /> : icon}
                {title && <span>{title}</span>}
                {badge}
            </CustomFlex>
        );
    }, [title, icon, badge]);

    const modalFooter = useMemo(() => {
        if (footer === false) return false;
        if (typeof footer === 'function') return footer(data ?? null, onClose);
        if (footer !== undefined) return footer;

        const resolvedExtra: ReactNode =
            typeof extraActions === 'function'
                ? data
                    ? extraActions(data, onClose)
                    : null
                : extraActions;

        return (
            <CustomFlex justify="end" align="center" gap="small" className="w-full">
                <CustomButton key="close" onClick={onClose}>
                    {closeText}
                </CustomButton>
                {resolvedExtra}
            </CustomFlex>
        );
    }, [footer, data, onClose, extraActions, closeText]);

    const content = useMemo(() => {
        if (!data) return null;

        if (sections?.length) {
            return <CustomDetailSection sections={sections} record={data} />;
        }

        if (typeof children === 'function') {
            return children(data);
        }

        return children;
    }, [data, sections, children]);

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            width={width}
            loading={loading}
            title={modalTitle}
            footer={modalFooter}
            className={className}
            bodyClassName={`p-4 ${bodyClassName}`.trim()}
        >
            {content}
        </CustomModal>
    );
};
