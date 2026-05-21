'use client';

import { Input, InputNumber, InputNumberProps, InputProps } from 'antd';

export type CustomInputProps = InputProps & {
    touchFriendly?: boolean;
};

export type CustomInputNumberProps = InputNumberProps & {
    touchFriendly?: boolean;
};

export const CustomInput = Object.assign(
    ({ touchFriendly = false, className, ...props }: CustomInputProps) => {
        const mergedClassName = [
            '[&_.ant-input]:rounded-hub [&_.ant-input]:border-hub-border',
            touchFriendly
                ? 'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10'
                : '',
            className,
        ]
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
    const mergedClassName = [
        '[&_.ant-input]:rounded-hub [&_.ant-input]:border-hub-border',
        touchFriendly
            ? 'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10'
            : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <InputNumber className={mergedClassName || undefined} {...props} />;
};
