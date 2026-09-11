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
    evaluationContext: FormEvaluationContext;
    colProps: Record<string, unknown>;
};

export const CodeEditorWidget = ({
    schema,
    evaluationContext,
    colProps,
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
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
                rules={rules}
            >
                <CodeDisplay
                    language={(rawProps.language as any) || 'javascript'}
                    maxHeight={rawProps.maxHeight || '500px'}
                    isDisplayLanguage={rawProps.isDisplayLanguage ?? true}
                    code={fieldValue || ''}
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
