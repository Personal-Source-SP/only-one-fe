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
import { normalizeResourceKey } from '@/utilities';

const { useBreakpoint } = CustomGrid;

type CustomModalFormProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    createInitialValues: TValues;
    modalForm: UseCustomModalFormResponse<TQueryFnData, TValues, TData>;
    extra?: ReactNode;
    children?: ReactNode;
    skeletonRows?: number;
    width?: number | string;
    destroyOnClose?: boolean;
    zIndex?: number;
    title?: ReactNode;
    okText?: ReactNode;
    cancelText?: ReactNode;
};

export const CustomModalForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    createInitialValues,
    modalForm,
    extra,
    children,
    skeletonRows = 8,
    width = 680,
    destroyOnClose = true,
    zIndex = 1200,
    title,
    okText = 'Lưu',
    cancelText = 'Hủy',
}: CustomModalFormProps<TQueryFnData, TValues, TData>) => {
    const { mode, resource, formProps, modalProps, formLoading: loading } = modalForm;

    const screens = useBreakpoint();
    const open = modalProps.open;

    const resourceKey = useMemo(() => normalizeResourceKey(resource), [resource]);

    const initialValues = useMemo(() => {
        if (mode === 'create') return createInitialValues;
        return formProps.initialValues as TValues;
    }, [mode, formProps.initialValues, createInitialValues]);

    const modalFooter = useMemo(
        () => (
            <CustomFlex justify="end" gap="middle">
                <CustomButton onClick={modalProps.onCancel}>{cancelText}</CustomButton>
                {extra}
                <CustomButton
                    type="primary"
                    {...modalForm.saveButtonProps}
                    onClick={modalProps.onOk}
                    loading={modalForm.saveButtonProps.loading}
                >
                    {okText}
                </CustomButton>
            </CustomFlex>
        ),
        [
            extra,
            okText,
            cancelText,
            modalForm?.saveButtonProps,
            modalProps.onCancel,
            modalProps.onOk,
        ],
    );

    useEffect(() => {
        if (!open && !loading) {
            formProps.form?.resetFields();
        }
    }, [loading, open, formProps.form]);

    const defaultTitle = mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa';

    return (
        <CustomModal
            {...modalProps}
            footer={modalFooter}
            destroyOnClose={destroyOnClose}
            width={screens.md ? width : '100%'}
            zIndex={zIndex}
            confirmLoading={modalProps.confirmLoading}
            title={title !== undefined ? title : defaultTitle}
        >
            {loading ? <CustomSkeleton active paragraph={{ rows: skeletonRows }} /> : null}
            <div style={{ display: loading ? 'none' : undefined }}>
                <CustomForm<TValues>
                    {...formProps}
                    layout="vertical"
                    initialValues={initialValues}
                    onFinish={formProps.onFinish}
                >
                    {children}
                </CustomForm>
            </div>
        </CustomModal>
    );
};
