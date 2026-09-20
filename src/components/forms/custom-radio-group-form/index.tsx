'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';

import { CustomForm, CustomRadio, type FormItemProps } from '@/components';
import { buildFormRules, type FormRuleConfig } from '@/utilities';

type CustomRadioGroupType = ComponentProps<typeof CustomRadio.Group>;

export type CustomRadioGroupFormProps = {
    name: FormItemProps['name'];
    label?: ReactNode;
    disabled?: boolean;
    rulesConfig?: FormRuleConfig[];
    options?: CustomRadioGroupType['options'];
    radioGroupProps?: CustomRadioGroupType;
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
