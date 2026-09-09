'use client';

import { HUB_ANTD_SEGMENTED_CLASS, mergeHubAntdClass } from '@/components/custom-antd';
import { Segmented, SegmentedProps } from 'antd';

export type CustomSegmentedProps = SegmentedProps;

export const CustomSegmented = ({ className, ...props }: CustomSegmentedProps) => (
    <Segmented className={mergeHubAntdClass(HUB_ANTD_SEGMENTED_CLASS, className)} {...props} />
);
