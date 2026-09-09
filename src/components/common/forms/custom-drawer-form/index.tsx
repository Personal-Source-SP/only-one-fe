'use client';

import {
    CustomButton,
    CustomDrawer,
    CustomFlex,
    CustomForm,
    CustomGrid,
    CustomSkeleton,
} from '@/components/custom-antd';
import { useEffect, useMemo, type ReactNode } from 'react';

import type { BaseRecord } from '@refinedev/core';

import type { UseCustomDrawerFormResponse } from '@/hooks';
import { normalizeResourceKey } from '@/utilities';

const { useBreakpoint } = CustomGrid;

type CustomDrawerFormProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    createInitialValues: TValues;
    drawerForm: UseCustomDrawerFormResponse<TQueryFnData, TValues, TData>;
    extra?: ReactNode;
    children?: ReactNode;
    skeletonRows?: number;
    width?: number | string;
    destroyOnHidden?: boolean;
    title?: ReactNode;
    saveText?: ReactNode;
};

export const CustomDrawerForm = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    createInitialValues,
    drawerForm,
    extra,
    children,
    skeletonRows = 8,
    width = 680,
    destroyOnHidden = true,
    title,
    saveText = 'Lưu',
}: CustomDrawerFormProps<TQueryFnData, TValues, TData>) => {
    const { mode, resource, formProps, drawerProps, formLoading: loading } = drawerForm;

    const screens = useBreakpoint();
    const open = drawerProps.open;

    const resourceKey = useMemo(() => normalizeResourceKey(resource), [resource]);

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

    useEffect(() => {
        if (!open && !loading) {
            formProps.form?.resetFields();
        }
    }, [loading, open, formProps.form]);

    const defaultTitle = mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa';

    return (
        <CustomDrawer
            {...drawerProps}
            loading={false}
            footer={drawerFooter}
            destroyOnHidden={destroyOnHidden}
            width={screens.md ? width : '100%'}
            title={title ?? defaultTitle}
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
        </CustomDrawer>
    );
};
