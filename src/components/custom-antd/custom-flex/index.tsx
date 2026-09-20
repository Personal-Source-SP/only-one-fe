'use client';

import { forwardRef } from 'react';
import { Flex, type FlexProps } from 'antd';

export type CustomFlexProps = FlexProps;

export const CustomFlex = forwardRef<HTMLDivElement, CustomFlexProps>((props, ref) => (
    <Flex ref={ref} {...props} />
));

CustomFlex.displayName = 'CustomFlex';
