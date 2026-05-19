'use client';

import { Tag, TagProps } from 'antd';

export type CustomTagProps = TagProps;

export const CustomTag = (props: CustomTagProps) => <Tag {...props} />;
