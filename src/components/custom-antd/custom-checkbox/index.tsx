'use client';

import { Checkbox, CheckboxProps } from 'antd';

export type CustomCheckboxProps = CheckboxProps;

export const CustomCheckbox = Object.assign(
    (props: CustomCheckboxProps) => <Checkbox {...props} />,
    {
        Group: Checkbox.Group,
    },
);
