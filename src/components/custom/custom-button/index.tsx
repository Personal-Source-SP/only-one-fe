'use client';

import { CUSTOM_BUTTON_CTA_CLASS_NAME, CUSTOM_BUTTON_TOUCH_CLASS_NAME } from '@/constants';
import { CustomButtonHubVariant } from '@/interfaces';
import { Button, ButtonProps } from 'antd';

type CustomButtonProps = ButtonProps & {
    hubVariant?: CustomButtonHubVariant;
    touchFriendly?: boolean;
};

export type { CustomButtonProps };

export const CustomButton = Object.assign(
    ({ hubVariant, touchFriendly = false, className, ...props }: CustomButtonProps) => {
        const mergedClassName = [
            hubVariant === 'cta' ? CUSTOM_BUTTON_CTA_CLASS_NAME : '',
            touchFriendly ? CUSTOM_BUTTON_TOUCH_CLASS_NAME : '',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        return <Button className={mergedClassName || undefined} {...props} />;
    },
    {
        Group: Button.Group,
    },
);
