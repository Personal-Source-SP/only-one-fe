'use client';

import {
    CustomSpace,
    HUB_ANTD_INPUT_CLASS,
    HUB_ANTD_INPUT_NUMBER_CLASS,
    mergeHubAntdClass,
} from '@/components/custom';
import { Input, InputNumber, InputNumberProps, InputProps } from 'antd';

export type CustomInputProps = InputProps & {
    touchFriendly?: boolean;
};

export type CustomInputNumberProps = InputNumberProps & {
    touchFriendly?: boolean;
};

export const CustomInput = Object.assign(
    ({ touchFriendly = false, addonAfter, addonBefore, className, ...props }: CustomInputProps) => {
        const mergedClassName = mergeHubAntdClass(
            HUB_ANTD_INPUT_CLASS,
            touchFriendly
                ? 'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10'
                : undefined,
            className,
        );

        const input = <Input className={mergedClassName || undefined} {...props} />;

        if (!addonAfter && !addonBefore) {
            return input;
        }

        return (
            <CustomSpace.Compact block>
                {addonBefore ? <CustomSpace.Addon>{addonBefore}</CustomSpace.Addon> : null}
                {input}
                {addonAfter ? <CustomSpace.Addon>{addonAfter}</CustomSpace.Addon> : null}
            </CustomSpace.Compact>
        );
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
    const mergedClassName = mergeHubAntdClass(
        HUB_ANTD_INPUT_NUMBER_CLASS,
        touchFriendly
            ? 'min-h-11 sm:min-h-10 [&_.ant-input]:min-h-11 sm:[&_.ant-input]:min-h-10'
            : undefined,
        className,
    );

    return <InputNumber className={mergedClassName || undefined} {...props} />;
};
