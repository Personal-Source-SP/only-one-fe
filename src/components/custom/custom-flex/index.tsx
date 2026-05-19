'use client';

import { Flex, FlexProps } from 'antd';

export type CustomFlexProps = FlexProps;

export const CustomFlex = (props: CustomFlexProps) => <Flex {...props} />;
