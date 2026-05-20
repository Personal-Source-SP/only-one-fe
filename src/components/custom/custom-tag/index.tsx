'use client';

import { CUSTOM_TAG_STATUS_CLASS_MAP } from '@/constants';
import { CustomTagStatus } from '@/interfaces';
import { Tag, TagProps } from 'antd';

type CustomTagProps = TagProps & {
    status?: CustomTagStatus;
};

export type { CustomTagProps };

export const CustomTag = ({ status, className, ...props }: CustomTagProps) => {
    const statusClassName = status ? CUSTOM_TAG_STATUS_CLASS_MAP[status] : '';

    const mergedClassName = [statusClassName, className].filter(Boolean).join(' ');

    return <Tag className={mergedClassName || undefined} {...props} />;
};
