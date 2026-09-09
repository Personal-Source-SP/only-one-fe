'use client';

import { Dropdown, DropdownProps } from 'antd';

export type CustomDropdownProps = DropdownProps;

export const CustomDropdown = (props: CustomDropdownProps) => <Dropdown {...props} />;
