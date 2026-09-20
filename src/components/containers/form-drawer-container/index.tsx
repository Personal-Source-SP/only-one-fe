'use client';

import { useMemo } from 'react';
import type { BaseRecord } from '@refinedev/core';

import { CustomFormSection } from '@/components';

import { CustomDrawerForm } from './CustomDrawerForm';
import type { FormDrawerContainerProps } from './types';

export const FormDrawerContainer = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TValues extends object = Record<string, unknown>,
    TData extends BaseRecord = TQueryFnData,
>({
    drawerForm,
    saveText,
    extra,
    width,
    title,
    createInitialValues = {} as TValues,
    sections,
    children,
}: FormDrawerContainerProps<TQueryFnData, TValues, TData>) => {
    const { mode, formProps } = drawerForm;

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
        <CustomDrawerForm<TQueryFnData, TValues, TData>
            {...drawerForm}
            width={width}
            title={title}
            extra={extra}
            saveText={saveText}
            drawerForm={drawerForm}
            createInitialValues={createInitialValues}
        >
            {content}
        </CustomDrawerForm>
    );
};
