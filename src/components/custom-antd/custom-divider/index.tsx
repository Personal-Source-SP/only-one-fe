'use client';

import { ReactNode } from 'react';
import { Divider, DividerProps } from 'antd';

type CustomDividerProps = DividerProps & {
    label?: ReactNode;
};

export type { CustomDividerProps };

export const CustomDivider = ({
    label,
    children,
    className,
    ...dividerProps
}: CustomDividerProps) => {
    const content = label ?? children;

    const mergedClassName = [
        '!my-0 !border-hub-border [&_.ant-divider-inner-text]:text-sm [&_.ant-divider-inner-text]:text-hub-muted',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Divider className={mergedClassName} {...dividerProps}>
            {content}
        </Divider>
    );
};
