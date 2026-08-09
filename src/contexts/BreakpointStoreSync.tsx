'use client';

import { CustomGrid } from '@/components/custom-antd';
import { useBreakpointStore } from '@/stores';
import { type PropsWithChildren, useEffect } from 'react';

export const BreakpointStoreSync = ({ children }: PropsWithChildren) => {
    const screens = CustomGrid.useBreakpoint();
    const setScreens = useBreakpointStore((s) => s.setScreens);

    useEffect(() => {
        setScreens(screens);
    }, [screens, setScreens]);

    return children;
};
