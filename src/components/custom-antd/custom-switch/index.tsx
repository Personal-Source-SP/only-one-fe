'use client';

import { CustomCol, CustomFlex, CustomForm } from '@/components/custom-antd';
import { Switch, type SwitchProps } from 'antd';
import { ReactNode } from 'react';

export type CustomSwitchProps = SwitchProps & {
    formFields?: string[];
    fieldLabel?: ReactNode;
    span?: number;
    fieldPlaceholder?: string;
};

export const CustomSwitch = ({
    fieldLabel,
    span,
    fieldPlaceholder,
    formFields,
    ...props
}: CustomSwitchProps) => {
    if (formFields && fieldLabel) {
        return (
            <CustomCol span={span ?? 12} className="!mb-2">
                <CustomFlex align="center" gap={10} className="!mb-0">
                    <CustomForm.Item name={formFields} valuePropName="checked">
                        <Switch {...props} />
                    </CustomForm.Item>
                    <span className="mb-1">{fieldLabel}</span>
                </CustomFlex>
                {!!fieldPlaceholder && (
                    <p className="!my-0 text-sm text-hub-muted">{fieldPlaceholder}</p>
                )}
            </CustomCol>
        );
    }

    return <Switch {...props} />;
};
