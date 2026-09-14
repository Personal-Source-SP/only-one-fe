'use client';

import { Empty, EmptyProps } from 'antd';

export type CustomEmptyProps = EmptyProps;

export const CustomEmpty = ({ className = '', ...props }: CustomEmptyProps) => (
    <Empty className={`w-full ${className}`.trim()} {...props} />
);
