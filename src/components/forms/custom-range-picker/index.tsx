'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useMemo } from 'react';

import { CustomForm, CustomPicker, type FormItemProps } from '@/components';
import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomRangePickerFormProps = {
    label?: ReactNode;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    rangePickerProps?: ComponentProps<typeof CustomPicker.RangePicker>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomRangePicker = ({
    label,
    name,
    rulesConfig,
    rangePickerProps,
    formItemProps,
}: CustomRangePickerFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomPicker.RangePicker size="large" className="w-full" {...rangePickerProps} />
        </CustomForm.Item>
    );
};
