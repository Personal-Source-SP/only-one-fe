'use client';

import type { IFormField } from '@/components/common';
import { CustomFormField, CustomModalForm } from '@/components/common';
import type { FormInstance } from '@/components/custom-antd';
import { CustomRow } from '@/components/custom-antd';
import type { FormMode, UseCustomModalFormResponse } from '@/hooks';
import type { BaseRecord } from '@refinedev/core';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

export type WrapperFormModalProps<
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
    fields?: IFormField<TValues>[];
    children?: ReactNode | ((form: FormInstance<TValues> | undefined, mode: FormMode) => ReactNode);
};

export const WrapperFormModal = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    modalForm,
    okText,
    cancelText,
    width = 600,
    title,
    createInitialValues = {} as TValues,
    fields,
    children,
}: WrapperFormModalProps<TQueryFnData, TValues, TData>) => {
    const { mode, formProps } = modalForm;

    const content = useMemo(() => {
        if (fields?.length) {
            return (
                <CustomRow gutter={[16, 0]}>
                    {fields.map((field) => (
                        <CustomFormField
                            mode={mode}
                            field={field}
                            form={formProps.form}
                            key={String(field.name)}
                        />
                    ))}
                </CustomRow>
            );
        }

        if (typeof children === 'function') {
            return children(formProps.form, mode);
        }

        return children;
    }, [fields, children, formProps.form, mode]);

    return (
        <CustomModalForm<TQueryFnData, TValues, TData>
            width={width}
            okText={okText}
            title={title}
            modalForm={modalForm}
            cancelText={cancelText}
            createInitialValues={createInitialValues}
        >
            {content}
        </CustomModalForm>
    );
};
