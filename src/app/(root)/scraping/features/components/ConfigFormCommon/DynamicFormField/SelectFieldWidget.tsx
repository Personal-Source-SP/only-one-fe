'use client';

import { CustomCol, CustomForm, CustomSelect } from '@/components/custom-antd';
import type {
    FormEvaluationContext,
    SelectFormFieldSchema,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type SelectFieldWidgetProps = {
    schema: SelectFormFieldSchema;
    colProps: Record<string, unknown>;
    evaluationContext: FormEvaluationContext;
};

export const SelectFieldWidget = ({
    schema,
    colProps,
    evaluationContext,
}: SelectFieldWidgetProps) => {
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
                <CustomSelect {...rawProps} />
            </CustomForm.Item>
        </CustomCol>
    );
};
