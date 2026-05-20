'use client';

import {
    HUB_COLOR_BORDER,
    HUB_COLOR_BORDER_CARD,
    HUB_COLOR_CTA,
    HUB_COLOR_PRIMARY,
    HUB_COLOR_TEXT,
    HUB_COLOR_TITLE,
    HUB_RADIUS,
    HUB_RADIUS_CARD,
    HUB_TOUCH_MIN_HEIGHT,
    plusJakartaSans,
} from '@/constants';
import { useThemeStore } from '@/stores/useThemeStore';
import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { type PropsWithChildren } from 'react';

type ColorModeContextProviderProps = {
    defaultMode?: string;
};

export const ColorModeContextProvider = ({
    children,
}: PropsWithChildren<ColorModeContextProviderProps>) => {
    useThemeStore();

    const { defaultAlgorithm } = theme;

    return (
        <ConfigProvider
            theme={{
                algorithm: defaultAlgorithm,
                hashed: false,
                token: {
                    borderRadius: HUB_RADIUS,
                    borderRadiusLG: HUB_RADIUS_CARD,
                    borderRadiusSM: 4,
                    colorBgContainer: '#FFFFFF',
                    colorBgLayout: '#F8FAFC',
                    colorBorder: HUB_COLOR_BORDER,
                    colorBorderSecondary: HUB_COLOR_BORDER_CARD,
                    colorError: '#DC2626',
                    colorPrimary: HUB_COLOR_PRIMARY,
                    colorPrimaryText: HUB_COLOR_TITLE,
                    colorPrimaryTextActive: HUB_COLOR_TITLE,
                    colorText: HUB_COLOR_TEXT,
                    colorTextSecondary: '#64748B',
                    controlHeight: 40,
                    controlHeightLG: HUB_TOUCH_MIN_HEIGHT,
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
                        borderRadiusLG: HUB_RADIUS,
                    },
                    Button: {
                        controlHeight: 36,
                        controlHeightLG: HUB_TOUCH_MIN_HEIGHT,
                        controlHeightSM: 32,
                        primaryShadow: 'none',
                    },
                    Card: {
                        borderRadiusLG: HUB_RADIUS_CARD,
                        boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                        colorBorderSecondary: HUB_COLOR_BORDER_CARD,
                        padding: 16,
                        paddingLG: 24,
                    },
                    Input: {
                        activeShadow: '0 0 0 2px rgba(37, 99, 235, 0.15)',
                        boxShadow: 'none',
                    },
                    Layout: {
                        bodyBg: '#F8FAFC',
                        headerBg: '#FFFFFF',
                        siderBg: '#FFFFFF',
                    },
                    Menu: {
                        colorItemBgSelected: '#EFF6FF',
                        fontSize: 14,
                        fontWeightStrong: 500,
                        itemBorderRadius: HUB_RADIUS,
                        itemHeight: 40,
                        itemMarginBlock: 4,
                        itemMarginInline: 8,
                        itemPaddingInline: 12,
                        itemSelectedColor: HUB_COLOR_PRIMARY,
                    },
                    Modal: {
                        borderRadiusLG: HUB_RADIUS_CARD,
                        titleFontSize: 18,
                    },
                    Select: {
                        optionSelectedBg: '#EFF6FF',
                    },
                    Table: {
                        headerBg: '#F8FAFC',
                        headerColor: HUB_COLOR_TITLE,
                    },
                    Tabs: {
                        horizontalItemMargin: '0 24px 0 0',
                        horizontalItemPadding: '12px 0',
                        inkBarColor: HUB_COLOR_PRIMARY,
                        itemSelectedColor: HUB_COLOR_PRIMARY,
                    },
                    Tag: {
                        borderRadiusSM: 4,
                    },
                },
            }}
        >
            <AntdApp>{children}</AntdApp>
        </ConfigProvider>
    );
};
