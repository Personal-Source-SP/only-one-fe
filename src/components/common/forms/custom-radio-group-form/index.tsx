'use client';

import { CustomForm, CustomRadio, type FormItemProps } from '@/components/custom-antd';
import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomRadioGroupProps = ComponentProps<typeof CustomRadio.Group>;

export type CustomRadioGroupFormProps = {
    name: FormItemProps['name'];
    label?: ReactNode;
    disabled?: boolean;
    rulesConfig?: FormRuleConfig[];
    options?: CustomRadioGroupProps['options'];
    radioGroupProps?: CustomRadioGroupProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomRadioGroupForm = ({
    name,
    label,
    disabled = false,
    rulesConfig,
    options,
    radioGroupProps,
    formItemProps,
}: CustomRadioGroupFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomRadio.Group disabled={disabled} options={options} {...radioGroupProps} />
        </CustomForm.Item>
    );
};
