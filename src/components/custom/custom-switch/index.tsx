'use client';

import { Switch } from 'antd';
import { ReactNode } from 'react';
import { CustomCol } from '../custom-row-col';
import { CustomFlex } from '../custom-flex';
import { CustomForm } from '../custom-form';

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
                <p className="text-sm text-gray-500 !my-0">{fieldPlaceholder}</p>
            )}
        </CustomCol>
    );
};
