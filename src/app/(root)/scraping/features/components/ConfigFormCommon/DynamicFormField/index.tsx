'use client';

import { isFieldVisible } from '@/app/(root)/scraping/features/utils';
import type { FormEvaluationContext, FormFieldSchema } from '@/app/(root)/scraping/features/types';
import { CodeEditorWidget } from './CodeEditorWidget';
import { JsonToggleWidget } from './JsonToggleWidget';
import { NumberFieldWidget } from './NumberFieldWidget';
import { SelectFieldWidget } from './SelectFieldWidget';
import { SwitchCardWidget } from './SwitchCardWidget';
import { TextFieldWidget } from './TextFieldWidget';

export type DynamicFormFieldProps = {
    schema: FormFieldSchema;
    evaluationContext: FormEvaluationContext;
};

export const DynamicFormField = ({ schema, evaluationContext }: DynamicFormFieldProps) => {
    if (!isFieldVisible(schema.visibleWhen, evaluationContext)) {
        return null;
    }

    const span =
        typeof schema.gridSpan === 'function'
            ? schema.gridSpan(evaluationContext)
            : schema.gridSpan || 24;

    const colProps = typeof span === 'number' ? { span } : span;

    switch (schema.type) {
        case 'select':
            return (
                <SelectFieldWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        case 'text':
            return (
                <TextFieldWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        case 'number':
            return (
                <NumberFieldWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        case 'switch_card':
            return (
                <SwitchCardWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        case 'code_editor':
            return (
                <CodeEditorWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        case 'json_toggle':
            return (
                <JsonToggleWidget
                    schema={schema}
                    evaluationContext={evaluationContext}
                    colProps={colProps}
                />
            );
        default:
            return null;
    }
};

export * from './CodeEditorWidget';
export * from './JsonToggleWidget';
export * from './NumberFieldWidget';
export * from './SelectFieldWidget';
export * from './SwitchCardWidget';
export * from './TextFieldWidget';
