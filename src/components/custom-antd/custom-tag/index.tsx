'use client';

import { CustomTagStatus } from '@/interfaces';
import { Tag, TagProps } from 'antd';

const CUSTOM_TAG_STATUS_CLASS_MAP = {
    active: 'border-green-200 bg-green-100 text-green-800',
    draft: 'border-slate-200 bg-slate-100 text-slate-600',
    error: 'border-red-200 bg-red-100 text-red-800',
    running: 'border-hub-border bg-hub-active text-hub-text',
    warning: 'border-amber-200 bg-amber-100 text-amber-800',
} as const;

type CustomTagProps = TagProps & {
    status?: CustomTagStatus;
};

export type { CustomTagProps };

export const CustomTag = ({ status, className, ...props }: CustomTagProps) => {
    const statusClassName = status ? CUSTOM_TAG_STATUS_CLASS_MAP[status] : '';

    const mergedClassName = [statusClassName, className].filter(Boolean).join(' ');

    return <Tag className={mergedClassName || undefined} {...props} />;
};
