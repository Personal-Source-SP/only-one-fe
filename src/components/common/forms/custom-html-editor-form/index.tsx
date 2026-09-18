'use client';

import { HtmlEditor, type HtmlEditorProps } from '@/components/common';
import { CustomForm, type FormItemProps } from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomHtmlEditorFormProps = {
    name: FormItemProps['name'];
    rows?: number;
    label?: ReactNode;
    disabled?: boolean;
    placeholder?: string;
    rulesConfig?: FormRuleConfig[];
    editorProps?: Partial<HtmlEditorProps>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomHtmlEditorForm = ({
    name,
    rows,
    label,
    disabled = false,
    placeholder,
    rulesConfig,
    editorProps,
    formItemProps,
}: CustomHtmlEditorFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <HtmlEditor
                rows={rows}
                disabled={disabled}
                placeholder={placeholder}
                {...editorProps}
            />
        </CustomForm.Item>
    );
};
