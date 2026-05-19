'use client';

import { Descriptions, DescriptionsProps } from 'antd';

export type CustomDescriptionsProps = DescriptionsProps;

export const CustomDescriptions = Object.assign(
    (props: CustomDescriptionsProps) => <Descriptions {...props} />,
    { Item: Descriptions.Item },
);
