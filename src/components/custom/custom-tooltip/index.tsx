'use client';

import { Tooltip, TooltipProps } from 'antd';

export type CustomTooltipProps = TooltipProps;

export const CustomTooltip = (props: CustomTooltipProps) => <Tooltip {...props} />;
