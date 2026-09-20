'use client';

import { type PropsWithChildren } from 'react';

import { HubThemedConfigProvider } from '@/components';
import { useThemeStore } from '@/stores';

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
