'use client';

import { CustomFormSection } from '@/components';
import type { BaseRecord } from '@refinedev/core';
import { useMemo } from 'react';
import { CustomModalForm } from './CustomModalForm';
import type { FormModalContainerProps } from './types';

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
            {...modalForm}
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
