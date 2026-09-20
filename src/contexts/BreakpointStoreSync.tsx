'use client';

import { type PropsWithChildren, useEffect } from 'react';

import { CustomGrid } from '@/components';
import { useBreakpointStore } from '@/stores';

export const BreakpointStoreSync = ({ children }: PropsWithChildren) => {
    const screens = CustomGrid.useBreakpoint();
    const setScreens = useBreakpointStore((s) => s.setScreens);

    useEffect(() => {
        setScreens(screens);
    }, [screens, setScreens]);

    return children;
};
