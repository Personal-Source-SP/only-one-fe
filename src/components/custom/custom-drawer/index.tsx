'use client';

import { Drawer, DrawerProps } from 'antd';
import { CustomGrid } from '../custom-grid';

export type CustomDrawerProps = DrawerProps;

export const CustomDrawer = ({ width, styles, ...props }: CustomDrawerProps) => {
    const screens = CustomGrid.useBreakpoint();
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
