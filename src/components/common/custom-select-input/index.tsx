'use client';

import {
    CustomForm,
    CustomSelect,
    type FormItemProps,
    type SelectProps,
} from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomSelectInputProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    selectProps?: SelectProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomSelectInput = ({
    label,
    name,
    rulesConfig,
    selectProps,
    formItemProps,
}: CustomSelectInputProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomSelect size="large" allowClear className="w-full" {...selectProps} />
        </CustomForm.Item>
    );
};
