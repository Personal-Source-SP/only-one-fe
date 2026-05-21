'use client';

import { useBreakpointStore } from '@/stores';
import { Drawer, DrawerProps } from 'antd';

export type CustomDrawerProps = DrawerProps;

export const CustomDrawer = ({ width, styles, ...props }: CustomDrawerProps) => {
    const isMobile = useBreakpointStore((s) => s.isMobile);

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
