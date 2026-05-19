'use client';

import { Drawer, DrawerProps } from 'antd';

export type CustomDrawerProps = DrawerProps;

export const CustomDrawer = (props: CustomDrawerProps) => <Drawer {...props} />;
