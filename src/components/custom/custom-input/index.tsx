'use client';

import { CUSTOM_INPUT_CLASS_NAME } from '@/constants';
import { Input, InputNumber, InputNumberProps, InputProps } from 'antd';

export type CustomInputProps = InputProps & {
    touchFriendly?: boolean;
};

export type CustomInputNumberProps = InputNumberProps & {
    touchFriendly?: boolean;
};

export const CustomInput = Object.assign(
    ({ touchFriendly = false, className, ...props }: CustomInputProps) => {
        const mergedClassName = [touchFriendly ? CUSTOM_INPUT_CLASS_NAME : '', className]
            .filter(Boolean)
            .join(' ');

        return <Input className={mergedClassName || undefined} {...props} />;
    },
    {
        Password: Input.Password,
        TextArea: Input.TextArea,
        Search: Input.Search,
    },
);

export const CustomInputNumber = ({
    touchFriendly = false,
    className,
    ...props
}: CustomInputNumberProps) => {
    const mergedClassName = [touchFriendly ? CUSTOM_INPUT_CLASS_NAME : '', className]
        .filter(Boolean)
        .join(' ');

    return <InputNumber className={mergedClassName || undefined} {...props} />;
};
