'use client';

import { inter } from '@/constants';
import { useThemeStore } from '@/stores/useThemeStore';
import { RefineThemes } from '@refinedev/antd';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { type PropsWithChildren } from 'react';

type ColorModeContextProviderProps = {
    defaultMode?: string;
};

export const ColorModeContextProvider = ({
    children,
}: PropsWithChildren<ColorModeContextProviderProps>) => {
    const { mode, setMode } = useThemeStore();

    const { defaultAlgorithm } = theme;

    return (
        <ConfigProvider
            theme={{
                ...RefineThemes.Blue,
                // algorithm: defaultAlgorithm,
                hashed: false,
                token: {
                    // Control
                    controlHeight: 40,
                    controlHeightLG: 44,
                    controlHeightSM: 32,
                    // Color system
                    // colorPrimary: '#111527',
                    colorPrimary: '#1840DC',
                    colorPrimaryText: '#111527',
                    colorPrimaryTextActive: '#111527',

                    // colorBgContainer: '#FFFFFF',
                    // colorTextBase: '#1F2937', // Dark text color for better readability
                    // colorBgLayout: '#F8FAFC', // Light gray background

                    // Border radius
                    borderRadius: 8, // Rounded corners for cards and buttons
                    borderRadiusLG: 12,
                    borderRadiusSM: 4,

                    // Spacing
                    padding: 16,
                    paddingXS: 8,
                    paddingLG: 24,
                    margin: 16,
                    marginXS: 8,
                    marginLG: 24,

                    // Font
                    fontSize: 14,
                    fontSizeHeading1: 24,
                    fontSizeHeading2: 20,
                    fontSizeHeading3: 16,
                    fontFamily: `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
                },
                components: {
                    Layout: {
                        // Sidebar styling
                        // colorBgHeader: '#FFFFFF',
                        bodyBg: '#F8FAFC',
                        // colorBgTrigger: '#FFFFFF',
                        // colorText: '#666D80',
                        // controlItemBgActive: '#E6E8EA',
                        // colorBgContainer: '#F6F8FA',
                    },
                    Menu: {
                        itemBorderRadius: 8,
                        itemMarginBlock: 4,
                        itemMarginInline: 8,
                        itemPaddingInline: 12,
                        itemHeight: 40,
                        fontSize: 14,
                        // itemSelectedBg: '#E6E8EA',
                        // itemHoverColor: '#666D80',
                        // itemHoverBg: '#EAEDF0',
                        colorItemBgSelected: '#E6E8EA',
                        itemSelectedColor: '#111527',
                        // colorItemBgHover: '#EAEDF0',
                        // colorBgContainer: '#F6F8FA',
                        fontWeightStrong: 500,
                        // colorBorder: 'transparent',
                    },
                    Card: {
                        paddingLG: 24,
                        padding: 16,
                        boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                        colorBorderSecondary: '#F0F0F0',
                        borderRadiusLG: 12,
                    },
                    Button: {
                        // paddingContentHorizontal: 16,
                        // controlHeight: 36,
                        // controlHeightLG: 40,
                        // controlHeightSM: 32,
                        // borderRadius: 6,
                    },
                    Input: {
                        // controlHeight: 40,
                        // controlHeightLG: 44,
                        // controlHeightSM: 32,
                        // paddingInline: 12,
                        // borderRadius: 8,
                        boxShadow: 'none',
                    },
                    Select: {
                        // controlHeight: 40,
                        // controlHeightLG: 44,
                        // controlHeightSM: 32,
                    },
                    Tabs: {
                        horizontalItemPadding: '12px 0',
                        horizontalItemMargin: '0 24px 0 0',
                    },
                },
            }}
        >
            <AntdApp>{children}</AntdApp>
        </ConfigProvider>
    );
};
