'use client';

import { CustomCol, CustomForm, CustomInput } from '@/components/custom-antd';
import type {
    FormEvaluationContext,
    TextFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type TextFieldWidgetProps = {
    schema: TextFormFieldSchema;
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const TextFieldWidget = ({ schema, evaluationContext, colProps }: TextFieldWidgetProps) => {
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
                <CustomInput placeholder={schema.placeholder} {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
