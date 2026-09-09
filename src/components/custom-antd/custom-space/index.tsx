'use client';

import { Space, SpaceProps } from 'antd';

export type CustomSpaceProps = SpaceProps;

export const CustomSpace = Object.assign((props: CustomSpaceProps) => <Space {...props} />, {
    Addon: Space.Addon,
    Compact: Space.Compact,
});
