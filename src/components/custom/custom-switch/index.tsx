'use client';

import { CustomCol, CustomFlex, CustomForm } from '@/components/custom';
import { Switch } from 'antd';
import { ReactNode } from 'react';

export type CustomSwitchProps = {
    formFields: string[];
    fieldLabel: ReactNode;
    span?: number;
    disabled?: boolean;
    fieldPlaceholder?: string;
    onChange?: (checked?: boolean) => void;
};

export const CustomSwitch = ({
    fieldLabel,
    span,
    fieldPlaceholder,
    formFields,
    onChange,
    disabled,
}: CustomSwitchProps) => {
    return (
        <CustomCol span={span ?? 12} className="!mb-2">
            <CustomFlex align="center" gap={10} className="!mb-0">
                <CustomForm.Item name={formFields} valuePropName="checked">
                    <Switch onChange={onChange} disabled={disabled} />
                </CustomForm.Item>
                <span className="mb-1">{fieldLabel}</span>
            </CustomFlex>
            {!!fieldPlaceholder && (
                <p className="!my-0 text-sm text-hub-muted">{fieldPlaceholder}</p>
            )}
        </CustomCol>
    );
};
