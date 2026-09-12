'use client';

import { useFeatureModalContext } from '@/app/(root)/scraping/features/context';
import type {
    CodeEditorFormFieldSchema,
    FormEvaluationContext,
} from '@/app/(root)/scraping/features/types';
import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomForm } from '@/components/custom-antd';
import { useCallback, useMemo } from 'react';
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

    const canEdit = useMemo(
        () => !isViewingHistory && !rawProps.disabled,
        [isViewingHistory, rawProps.disabled],
    );

    const handleCodeChange = useCallback(
        (newCode: string): void => {
            form.setFieldValue(schema.name, newCode);
        },
        [form, schema.name],
    );

    return (
        <CustomCol {...colProps}>
            <CustomForm.Item
                rules={rules}
                name={schema.name}
                label={<FormDiffLabel fieldKey={schema.name} label={labelText as string} />}
            >
                <CodeDisplay
                    code={fieldValue}
                    language={rawProps.language}
                    maxHeight={rawProps.maxHeight}
                    isDisplayLanguage={rawProps.isDisplayLanguage ?? true}
                    onCodeChange={canEdit ? handleCodeChange : undefined}
                />
            </CustomForm.Item>
        </CustomCol>
    );
};
