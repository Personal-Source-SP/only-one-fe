'use client';

import { Badge, BadgeProps } from 'antd';

export type CustomBadgeProps = BadgeProps;

export const CustomBadge = (props: CustomBadgeProps) => <Badge {...props} />;
