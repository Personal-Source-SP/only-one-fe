'use client';

import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomForm } from '@/components/custom-antd';
import { useFeatureModalContext } from '@/app/(root)/scraping/features/context';
import type {
    CodeEditorFormFieldSchema,
    FormEvaluationContext,
} from '@/app/(root)/scraping/features/types';
import { FormDiffLabel } from '../FormDiffLabel';

export type CodeEditorWidgetProps = {
    schema: CodeEditorFormFieldSchema;
    colProps: Record<string, unknown>;
    evaluationContext: FormEvaluationContext;
};

export const CodeEditorWidget = ({
    schema,
    colProps,
    evaluationContext,
}: CodeEditorWidgetProps) => {
    const { form, isViewingHistory } = useFeatureModalContext();

    const fieldValue = CustomForm.useWatch(schema.name, form);

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
                <CodeDisplay
                    code={fieldValue || ''}
                    maxHeight={rawProps.maxHeight || '220px'}
                    language={(rawProps.language as any) || 'javascript'}
                    isDisplayLanguage={rawProps.isDisplayLanguage ?? true}
                    onCodeChange={
                        !isViewingHistory && !rawProps.disabled
                            ? (newCode: string): void => {
                                  form.setFieldValue(schema.name, newCode);
                              }
                            : undefined
                    }
                />
            </CustomForm.Item>
        </CustomCol>
    );
};
