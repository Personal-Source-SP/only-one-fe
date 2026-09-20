import type { ReactNode } from 'react';
import type { BaseRecord } from '@refinedev/core';

import type { FormInstance } from '@/components';
import type { IFormSection } from '@/components';
import type { FormMode, UseCustomModalFormResponse } from '@/hooks';

export type CustomModalFormProps<
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

export type FormModalContainerProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = {
    modalForm: UseCustomModalFormResponse<TQueryFnData, TValues, TData>;
    okText?: ReactNode;
    cancelText?: ReactNode;
    width?: number | string;
    title?: string | ReactNode;
    createInitialValues?: TValues;
    sections?: IFormSection<TValues>[];
    children?: ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
};

export type WrapperFormModalProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
> = FormModalContainerProps<TQueryFnData, TValues, TData>;
