'use client';

import {
    CustomForm,
    CustomSwitch,
    type FormItemProps,
    type SwitchProps,
} from '@/components/custom';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomSwitchFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    switchProps?: SwitchProps;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomSwitchForm = ({
    label,
    name,
    rulesConfig,
    switchProps,
    formItemProps,
}: CustomSwitchFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item
            {...formItemProps}
            label={label}
            name={name}
            valuePropName="checked"
            rules={formRules}
        >
            <CustomSwitch {...switchProps} />
        </CustomForm.Item>
    );
};
