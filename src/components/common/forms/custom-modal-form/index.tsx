'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomGrid,
    CustomModal,
    CustomSkeleton,
} from '@/components/custom-antd';
import { useEffect, useMemo, type ReactNode } from 'react';

import type { BaseRecord } from '@refinedev/core';

import type { UseCustomModalFormResponse } from '@/hooks';

const { useBreakpoint } = CustomGrid;

type CustomModalFormProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    createInitialValues: TValues;
    modalForm: UseCustomModalFormResponse<TQueryFnData, TValues, TData>;
    zIndex?: number;
    extra?: ReactNode;
    title?: ReactNode;
    okText?: ReactNode;
    children?: ReactNode;
    skeletonRows?: number;
    cancelText?: ReactNode;
    width?: number | string;
    destroyOnHidden?: boolean;
};

export const CustomModalForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    createInitialValues,
    modalForm,
    zIndex = 1200,
    extra,
    title,
    okText = 'Lưu',
    children,
    skeletonRows = 8,
    cancelText = 'Hủy',
    width = 680,
    destroyOnHidden = true,
}: CustomModalFormProps<TQueryFnData, TValues, TData>) => {
    const screens = useBreakpoint();

    const { mode, formProps, modalProps, isLoading } = modalForm;

    const initialValues = useMemo(() => {
        if (mode === 'create') return createInitialValues;
        return formProps.initialValues as TValues;
    }, [mode, formProps.initialValues, createInitialValues]);

    const modalFooter = useMemo(
        () => (
            <CustomFlex justify="end" gap="middle">
                <CustomButton onClick={modalProps.onCancel}>{cancelText}</CustomButton>
                {extra}
                <CustomButton type="primary" {...modalForm.saveButtonProps}>
                    {okText}
                </CustomButton>
            </CustomFlex>
        ),
        [extra, okText, cancelText, modalForm?.saveButtonProps, modalProps.onCancel],
    );

    const titleModal = useMemo(() => {
        if (title) return title;
        return mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa';
    }, [mode, title]);

    useEffect(() => {
        if (!modalProps.open && !isLoading) {
            formProps.form?.resetFields();
        }
    }, [isLoading, modalProps.open, formProps.form]);

    return (
        <CustomModal
            {...modalProps}
            zIndex={zIndex}
            title={titleModal}
            footer={modalFooter}
            destroyOnHidden={destroyOnHidden}
            width={screens.md ? width : '100%'}
        >
            {isLoading ? (
                <CustomSkeleton active paragraph={{ rows: skeletonRows }} />
            ) : (
                <CustomForm<TValues>
                    {...formProps}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={formProps.onFinish}
                    className={`[&_.ant-form-item]:mb-4 ${formProps?.className ?? ''}`.trim()}
                >
                    {children}
                </CustomForm>
            )}
        </CustomModal>
    );
};
