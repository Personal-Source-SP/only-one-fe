'use client';

import { HubThemedConfigProvider } from '@/components';
import { useThemeStore } from '@/stores';
import { type PropsWithChildren } from 'react';

import { BreakpointStoreSync } from './BreakpointStoreSync';

type ColorModeContextProviderProps = {
    defaultMode?: string;
};

export const ColorModeContextProvider = ({
    children,
}: PropsWithChildren<ColorModeContextProviderProps>) => {
    useThemeStore();

    return (
        <HubThemedConfigProvider>
            <BreakpointStoreSync>{children}</BreakpointStoreSync>
        </HubThemedConfigProvider>
    );
};
