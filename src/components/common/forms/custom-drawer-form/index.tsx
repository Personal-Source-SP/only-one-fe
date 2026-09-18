'use client';

import {
    CustomButton,
    CustomDrawer,
    CustomFlex,
    CustomForm,
    CustomGrid,
    CustomSkeleton,
} from '@/components/custom-antd';
import type { UseCustomDrawerFormResponse } from '@/hooks';
import type { BaseRecord } from '@refinedev/core';
import { useEffect, useMemo, type ReactNode } from 'react';

const { useBreakpoint } = CustomGrid;

type CustomDrawerFormProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    createInitialValues: TValues;
    drawerForm: UseCustomDrawerFormResponse<TQueryFnData, TValues, TData>;
    extra?: ReactNode;
    title?: ReactNode;
    saveText?: ReactNode;
    children?: ReactNode;
    skeletonRows?: number;
    width?: number | string;
    destroyOnHidden?: boolean;
};

export const CustomDrawerForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    createInitialValues,
    drawerForm,
    extra,
    title,
    saveText = 'Lưu',
    children,
    skeletonRows = 8,
    width = 680,
    destroyOnHidden = true,
}: CustomDrawerFormProps<TQueryFnData, TValues, TData>) => {
    const { mode, formProps, drawerProps, formLoading: loading } = drawerForm;

    const screens = useBreakpoint();
    const open = drawerProps.open;

    const initialValues = useMemo(() => {
        if (mode === 'create') return createInitialValues;
        return formProps.initialValues as TValues;
    }, [mode, formProps.initialValues, createInitialValues]);

    const drawerFooter = useMemo(
        () => (
            <CustomFlex justify="end" gap="middle">
                {extra}
                <CustomButton {...drawerForm.saveButtonProps} type="primary">
                    {saveText}
                </CustomButton>
            </CustomFlex>
        ),
        [extra, drawerForm?.saveButtonProps, saveText],
    );

    const defaultTitle = useMemo(() => (mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'), [mode]);

    useEffect(() => {
        if (!open && !loading) {
            formProps.form?.resetFields();
        }
    }, [loading, open, formProps.form]);

    return (
        <CustomDrawer
            {...drawerProps}
            loading={false}
            footer={drawerFooter}
            title={title ?? defaultTitle}
            destroyOnHidden={destroyOnHidden}
            width={screens.md ? width : '100%'}
        >
            <CustomSkeleton active={loading} paragraph={{ rows: skeletonRows }}>
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
            </CustomSkeleton>
        </CustomDrawer>
    );
};
