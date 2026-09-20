'use client';

import { CodeDisplay } from '@/components';
import { CustomForm, type FormInstance, type FormItemProps } from '@/components';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomCodeEditorFormProps<TValues = unknown> = {
    label?: ReactNode;
    disabled?: boolean;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    maxHeight?: number | string;
    isDisplayLanguage?: boolean;
    form?: FormInstance<TValues>;
    language?: 'json' | 'javascript' | 'html';
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomCodeEditorForm = <TValues extends object = Record<string, unknown>>({
    label,
    disabled = false,
    name,
    rulesConfig,
    maxHeight,
    isDisplayLanguage = true,
    form,
    language = 'json',
    formItemProps,
}: CustomCodeEditorFormProps<TValues>) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    const codeValue = useMemo(
        () => (name && form ? (form.getFieldValue(name) as string) : '') ?? '',
        [name, form],
    );

    const formattedMaxHeight = useMemo(
        () => (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight),
        [maxHeight],
    );

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CodeDisplay
                code={codeValue}
                language={language}
                maxHeight={formattedMaxHeight}
                isDisplayLanguage={isDisplayLanguage}
                onCodeChange={
                    !disabled && name
                        ? (newCode: string) => form?.setFieldValue(name, newCode)
                        : undefined
                }
            />
        </CustomForm.Item>
    );
};
