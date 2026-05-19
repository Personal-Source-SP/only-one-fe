'use client';

import { Input, InputNumber, InputNumberProps, InputProps } from 'antd';

export type CustomInputProps = InputProps;

export type CustomInputNumberProps = InputNumberProps;

export const CustomInput = Object.assign((props: CustomInputProps) => <Input {...props} />, {
    Password: Input.Password,
    TextArea: Input.TextArea,
    Search: Input.Search,
});

export const CustomInputNumber = (props: CustomInputNumberProps) => <InputNumber {...props} />;
