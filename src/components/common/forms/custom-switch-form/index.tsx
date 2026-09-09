'use client';

import {
    CustomForm,
    CustomSwitch,
    type FormItemProps,
    type SwitchProps,
} from '@/components/custom-antd';
import { useMemo, type ReactNode } from 'react';

import { buildFormRules, type FormRuleConfig } from '@/utilities';

export type CustomSwitchFormProps = {
    name: FormItemProps['name'];
    label?: ReactNode;
    description?: ReactNode;
    switchProps?: SwitchProps;
    rulesConfig?: FormRuleConfig[];
    formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name' | 'rules'>;
};

export const CustomSwitchForm = ({
    name,
    label,
    description,
    rulesConfig,
    switchProps,
    formItemProps,
}: CustomSwitchFormProps) => {
    const formRules = useMemo(() => buildFormRules({ rules: rulesConfig ?? [] }), [rulesConfig]);

    if (description) {
        return (
            <div
                className={`flex items-center justify-between gap-4 p-3 rounded-xl border border-hub-border/70 bg-hub-section/30 mb-3 ${formItemProps?.className ?? ''}`.trim()}
            >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    {label && (
                        <span className="text-sm font-medium text-hub-title leading-tight">
                            {label}
                        </span>
                    )}
                    <span className="text-xs text-hub-muted leading-normal">{description}</span>
                </div>
                <CustomForm.Item
                    {...formItemProps}
                    noStyle
                    name={name}
                    rules={formRules}
                    valuePropName="checked"
                >
                    <CustomSwitch className="shrink-0" {...switchProps} />
                </CustomForm.Item>
            </div>
        );
    }

    return (
        <CustomForm.Item
            {...formItemProps}
            name={name}
            label={label}
            rules={formRules}
            valuePropName="checked"
        >
            <CustomSwitch {...switchProps} />
        </CustomForm.Item>
    );
};
