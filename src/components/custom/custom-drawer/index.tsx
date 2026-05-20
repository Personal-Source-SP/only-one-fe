'use client';

import { Grid, Drawer, DrawerProps } from 'antd';

export type CustomDrawerProps = DrawerProps;

export const CustomDrawer = ({ width, styles, ...props }: CustomDrawerProps) => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    return (
        <Drawer
            width={isMobile ? '100%' : width}
            styles={{
                body: { padding: isMobile ? 16 : 24 },
                ...styles,
            }}
            {...props}
        />
    );
};
