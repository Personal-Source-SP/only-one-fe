'use client';

import { CustomCol, CustomForm, CustomInput } from '@/components/custom-antd';
import type {
    FormEvaluationContext,
    TextFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { useMemo } from 'react';
import { FormDiffLabel } from '../FormDiffLabel';

export type TextFieldWidgetProps = {
    schema: TextFormFieldSchema;
    colProps: Record<string, unknown>;
    evaluationContext: FormEvaluationContext;
};

export const TextFieldWidget = ({ schema, colProps, evaluationContext }: TextFieldWidgetProps) => {
    const labelText = useMemo(
        () => (typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label),
        [evaluationContext, schema.label],
    );

    const rules = useMemo(
        () => (schema.getRules ? schema.getRules(evaluationContext) : undefined),
        [evaluationContext, schema.getRules],
    );

    const rawProps = useMemo(
        () =>
            typeof schema.fieldProps === 'function'
                ? schema.fieldProps(evaluationContext)
                : schema.fieldProps || {},
        [evaluationContext, schema.fieldProps],
    );

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                rules={rules}
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
            >
                <CustomInput placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
