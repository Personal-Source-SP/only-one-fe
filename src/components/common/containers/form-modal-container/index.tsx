'use client';

import { CustomFormSection, CustomModalForm } from '@/components/common';
import type { FormInstance } from '@/components/custom-antd';
import type { FormMode, UseCustomModalFormResponse } from '@/hooks';
import type { IFormSection } from '@/interfaces';
import type { BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

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

export const FormModalContainer = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    modalForm,
    okText,
    cancelText,
    width,
    title,
    createInitialValues = {} as TValues,
    sections,
    children,
}: FormModalContainerProps<TQueryFnData, TValues, TData>) => {
    const { mode, formProps } = modalForm;

    const content = useMemo(() => {
        if (sections?.length) {
            return <CustomFormSection sections={sections} form={formProps.form} mode={mode} />;
        }

        if (typeof children === 'function') {
            return children(formProps.form, mode);
        }

        return children;
    }, [sections, children, formProps.form, mode]);

    return (
        <CustomModalForm<TQueryFnData, TValues, TData>
            width={width}
            title={title}
            okText={okText}
            modalForm={modalForm}
            cancelText={cancelText}
            createInitialValues={createInitialValues}
        >
            {content}
        </CustomModalForm>
    );
};
