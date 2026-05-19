'use client';

import { CUSTOM_DIVIDER_CLASS_NAME } from '@/constants';
import { Divider, DividerProps } from 'antd';
import { ReactNode } from 'react';

type CustomDividerProps = DividerProps & {
    label?: ReactNode;
};

export type { CustomDividerProps };

const CustomDivider = ({ label, children, className, ...dividerProps }: CustomDividerProps) => {
    const content = label ?? children;

    const mergedClassName = [CUSTOM_DIVIDER_CLASS_NAME, className].filter(Boolean).join(' ');

    return (
        <Divider className={mergedClassName} {...dividerProps}>
            {content}
        </Divider>
    );
};

export default CustomDivider;
