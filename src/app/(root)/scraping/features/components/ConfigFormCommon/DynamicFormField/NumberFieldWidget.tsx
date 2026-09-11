'use client';

import { CustomCol, CustomForm, CustomInputNumber } from '@/components/custom-antd';
import type {
    FormEvaluationContext,
    NumberFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type NumberFieldWidgetProps = {
    schema: NumberFormFieldSchema;
    colProps: Record<string, unknown>;
    evaluationContext: FormEvaluationContext;
};

export const NumberFieldWidget = ({
    schema,
    colProps,
    evaluationContext,
}: NumberFieldWidgetProps) => {
    const labelText =
        typeof schema.label === 'function' ? schema.label(evaluationContext) : schema.label;

    const rules = schema.getRules ? schema.getRules(evaluationContext) : undefined;

    const rawProps =
        typeof schema.fieldProps === 'function'
            ? schema.fieldProps(evaluationContext)
            : schema.fieldProps || {};

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                rules={rules}
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
            >
                <CustomInputNumber placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
