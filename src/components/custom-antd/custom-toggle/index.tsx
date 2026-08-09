'use client';

import { Switch, SwitchProps } from 'antd';

export type CustomToggleProps = SwitchProps;

export const CustomToggle = (props: CustomToggleProps) => <Switch {...props} />;
