'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';

import { CustomCheckbox, CustomForm, type FormItemProps } from '@/components';
import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomCheckboxGroupProps = ComponentProps<typeof CustomCheckbox.Group>;

export type CustomCheckboxGroupFormProps = {
    label?: ReactNode;
    disabled?: boolean;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    options?: CustomCheckboxGroupProps['options'];
    checkboxGroupProps?: CustomCheckboxGroupProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomCheckboxGroupForm = ({
    label,
    disabled = false,
    name,
    rulesConfig,
    options,
    checkboxGroupProps,
    formItemProps,
}: CustomCheckboxGroupFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomCheckbox.Group disabled={disabled} options={options} {...checkboxGroupProps} />
        </CustomForm.Item>
    );
};
