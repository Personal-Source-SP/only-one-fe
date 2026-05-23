'use client';

import { CustomApp, CustomConfigProvider, theme } from '@/components/custom';
import { plusJakartaSans } from '@/constants';
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

    const { defaultAlgorithm } = theme;

    return (
        <CustomConfigProvider
            theme={{
                algorithm: defaultAlgorithm,
                hashed: false,
                token: {
                    borderRadius: 8,
                    borderRadiusLG: 12,
                    borderRadiusSM: 4,
                    colorBgContainer: '#FFFFFF',
                    colorBgLayout: '#F8FAFC',
                    colorBorder: '#E2E8E6',
                    colorBorderSecondary: '#ECEFED',
                    colorError: '#DC2626',
                    colorPrimary: '#EA580C',
                    colorPrimaryText: '#1E293B',
                    colorPrimaryTextActive: '#1E293B',
                    colorText: '#334155',
                    colorTextSecondary: '#64748B',
                    controlHeight: 40,
                    controlHeightLG: 44,
                    controlHeightSM: 32,
                    fontFamily: `${plusJakartaSans.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
                    fontSize: 14,
                    fontSizeHeading1: 30,
                    fontSizeHeading2: 24,
                    fontSizeHeading3: 18,
                    margin: 16,
                    marginLG: 24,
                    marginXS: 8,
                    padding: 16,
                    paddingLG: 24,
                    paddingXS: 8,
                },
                components: {
                    Alert: {
                        borderRadiusLG: 8,
                    },
                    Button: {
                        controlHeight: 36,
                        controlHeightLG: 44,
                        controlHeightSM: 32,
                        primaryShadow: 'none',
                    },
                    Card: {
                        borderRadiusLG: 12,
                        boxShadowTertiary: 'none',
                        colorBorderSecondary: '#ECEFED',
                        padding: 16,
                        paddingLG: 24,
                    },
                    Input: {
                        activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.15)',
                        boxShadow: 'none',
                    },
                    Layout: {
                        bodyBg: 'transparent',
                        headerBg: '#FFFFFF',
                        siderBg: '#FFFFFF',
                    },
                    Menu: {
                        colorItemBgSelected: '#FFF7ED',
                        fontSize: 14,
                        fontWeightStrong: 500,
                        itemBorderRadius: 8,
                        itemHeight: 40,
                        itemMarginBlock: 4,
                        itemMarginInline: 8,
                        itemPaddingInline: 12,
                        itemSelectedColor: '#EA580C',
                    },
                    Modal: {
                        borderRadiusLG: 12,
                        titleFontSize: 18,
                    },
                    Select: {
                        optionSelectedBg: '#FFF7ED',
                    },
                    Table: {
                        headerBg: '#F1F5F9',
                        headerColor: '#1E293B',
                    },
                    Tabs: {
                        horizontalItemMargin: '0 24px 0 0',
                        horizontalItemPadding: '12px 0',
                        inkBarColor: '#EA580C',
                        itemSelectedColor: '#EA580C',
                    },
                    Tag: {
                        borderRadiusSM: 4,
                    },
                },
            }}
        >
            <CustomApp>
                <HubThemePaletteProvider>
                    <BreakpointStoreSync>{children}</BreakpointStoreSync>
                </HubThemePaletteProvider>
            </CustomApp>
        </CustomConfigProvider>
    );
};
