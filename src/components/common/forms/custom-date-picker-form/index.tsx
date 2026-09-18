'use client';

import { CustomForm, CustomPicker, type FormItemProps } from '@/components/custom-antd';
import { useMemo, type ComponentProps, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomDatePickerFormProps = {
    label?: ReactNode;
    disabled?: boolean;
    placeholder?: string;
    name: FormItemProps['name'];
    rulesConfig?: FormRuleConfig[];
    pickerProps?: ComponentProps<typeof CustomPicker>;
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomDatePickerForm = ({
    label,
    disabled = false,
    placeholder,
    name,
    rulesConfig,
    pickerProps,
    formItemProps,
}: CustomDatePickerFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    return (
        <CustomForm.Item {...formItemProps} label={label} name={name} rules={formRules}>
            <CustomPicker
                className="w-full"
                disabled={disabled}
                placeholder={placeholder}
                {...pickerProps}
            />
        </CustomForm.Item>
    );
};
