'use client';

import { HubThemedConfigProvider } from '@/components/custom-antd';
import { useThemeStore } from '@/stores';
import { type PropsWithChildren } from 'react';

import { BreakpointStoreSync } from './BreakpointStoreSync';
import { HubThemePaletteProvider } from './HubThemePaletteContext';

type ColorModeContextProviderProps = {
    defaultMode?: string;
};

export const ColorModeContextProvider = ({
    children,
}: PropsWithChildren<ColorModeContextProviderProps>) => {
    useThemeStore();

    return (
        <HubThemePaletteProvider>
            <HubThemedConfigProvider>
                <BreakpointStoreSync>{children}</BreakpointStoreSync>
            </HubThemedConfigProvider>
        </HubThemePaletteProvider>
    );
};
