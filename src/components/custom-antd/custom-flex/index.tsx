'use client';

import { Flex, type FlexProps } from 'antd';
import { forwardRef } from 'react';

export type CustomFlexProps = FlexProps;

export const CustomFlex = forwardRef<HTMLDivElement, CustomFlexProps>((props, ref) => (
    <Flex ref={ref} {...props} />
));

CustomFlex.displayName = 'CustomFlex';
