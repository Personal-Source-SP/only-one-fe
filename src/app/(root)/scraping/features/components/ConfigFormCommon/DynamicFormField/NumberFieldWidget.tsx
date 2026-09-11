'use client';

import { CustomCol, CustomForm, CustomInputNumber } from '@/components/custom-antd';
import type {
    FormEvaluationContext,
    NumberFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type NumberFieldWidgetProps = {
    schema: NumberFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const NumberFieldWidget = ({
    schema,
    evaluationContext,
    colProps,
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
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
                rules={rules}
            >
                <CustomInputNumber placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
