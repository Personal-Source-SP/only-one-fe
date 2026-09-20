import type { FormInstance } from '@/components';
import type { IFormSection } from '@/components';
import type { FormMode, UseCustomDrawerFormResponse } from '@/hooks';
import type { BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';

export type CustomDrawerFormProps<
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

export type FormDrawerContainerProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    drawerForm: UseCustomDrawerFormResponse<TQueryFnData, TValues, TData>;
    saveText?: ReactNode;
    extra?: ReactNode;
    width?: number | string;
    title?: string | ReactNode;
    createInitialValues?: TValues;
    sections?: IFormSection<TValues>[];
    children?: ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
};

export type WrapperFormDrawerProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = FormDrawerContainerProps<TQueryFnData, TValues, TData>;
