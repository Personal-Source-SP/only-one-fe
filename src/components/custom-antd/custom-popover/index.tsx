'use client';

import { Popover, PopoverProps } from 'antd';

export type CustomPopoverProps = PopoverProps;

export const CustomPopover = (props: CustomPopoverProps) => <Popover {...props} />;
