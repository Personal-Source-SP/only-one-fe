'use client';

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
            hubVariant === 'cta'
                ? '!border-hub-cta !bg-hub-cta !text-white hover:!opacity-90 focus-visible:!outline-hub-cta'
                : '',
            touchFriendly ? 'min-h-11 sm:min-h-9' : '',
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
