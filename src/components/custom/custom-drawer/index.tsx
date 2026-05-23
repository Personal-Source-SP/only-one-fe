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
                body: {
                    background: 'var(--hub-section)',
                    padding: isMobile ? 16 : 24,
                    ...styles?.body,
                },
                content: {
                    background: 'var(--hub-surface)',
                    ...styles?.content,
                },
                header: {
                    background: 'var(--hub-surface)',
                    borderBottom: '1px solid var(--hub-border)',
                    ...styles?.header,
                },
                ...styles,
            }}
            {...props}
        />
    );
};
