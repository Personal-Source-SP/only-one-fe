import { theme, type ThemeConfig } from 'antd';

const readHubCssVar = (name: string, fallback: string): string => {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    return value || fallback;
};

export const buildHubAntdTheme = (): ThemeConfig => {
    const colorBgLayout = readHubCssVar('--hub-bg', '#ddd4cb');
    const colorBgContainer = readHubCssVar('--hub-section', '#faf7f4');
    const colorBgElevated = readHubCssVar('--hub-surface', '#ffffff');
    const colorBorder = readHubCssVar('--hub-border', '#cfc4b8');
    const colorBorderSecondary = readHubCssVar('--hub-border-card', '#e0d6cc');
    const colorPrimary = readHubCssVar('--hub-primary', '#ea580c');
    const colorText = readHubCssVar('--hub-text', '#334155');
    const colorTextSecondary = readHubCssVar('--hub-muted', '#64748b');
    const colorTextHeading = readHubCssVar('--hub-title', '#1e293b');
    const colorFillAlter = readHubCssVar('--hub-section-muted', '#ebe4dc');
    const colorPrimaryBg = readHubCssVar('--hub-active', '#ffedd5');

    return {
        algorithm: theme.defaultAlgorithm,
        hashed: false,
        token: {
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 4,
            colorBgContainer,
            colorBgElevated,
            colorBgLayout,
            colorBorder,
            colorBorderSecondary,
            colorError: '#dc2626',
            colorFillAlter,
            colorPrimary,
            colorPrimaryBg,
            colorPrimaryText: colorTextHeading,
            colorPrimaryTextActive: colorTextHeading,
            colorText,
            colorTextSecondary,
            colorTextHeading,
            controlHeight: 40,
            controlHeightLG: 44,
            controlHeightSM: 32,
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
                colorBgContainer,
                colorBorderSecondary,
                padding: 16,
                paddingLG: 24,
            },
            Drawer: {
                colorBgElevated,
                colorBgMask: 'rgba(15, 23, 42, 0.45)',
            },
            Dropdown: {
                colorBgElevated,
            },
            Input: {
                activeShadow: `0 0 0 2px color-mix(in srgb, ${colorPrimary} 18%, transparent)`,
                boxShadow: 'none',
                colorBgContainer: colorBgElevated,
                colorBorder,
                colorText,
                colorTextPlaceholder: colorTextSecondary,
            },
            Layout: {
                bodyBg: 'transparent',
                headerBg: colorBgElevated,
                siderBg: colorBgElevated,
            },
            Menu: {
                colorItemBgSelected: colorPrimaryBg,
                fontSize: 14,
                fontWeightStrong: 500,
                itemBorderRadius: 8,
                itemHeight: 40,
                itemMarginBlock: 4,
                itemMarginInline: 8,
                itemPaddingInline: 12,
                itemSelectedColor: colorPrimary,
            },
            Modal: {
                borderRadiusLG: 12,
                colorBgElevated,
                contentBg: colorBgElevated,
                headerBg: colorBgElevated,
                titleFontSize: 18,
            },
            Pagination: {
                colorBgContainer: colorBgElevated,
                colorBorder,
                colorPrimary,
            },
            Popover: {
                colorBgElevated,
            },
            Select: {
                colorBgContainer: colorBgElevated,
                colorBgElevated,
                colorBorder,
                optionSelectedBg: colorPrimaryBg,
            },
            Segmented: {
                itemActiveBg: colorBgElevated,
                itemHoverBg: colorFillAlter,
                itemSelectedBg: colorBgElevated,
                trackBg: colorFillAlter,
            },
            Steps: {
                colorPrimary,
                colorText,
                colorTextDescription: colorTextSecondary,
            },
            Table: {
                headerBg: colorFillAlter,
                headerColor: colorTextHeading,
                rowHoverBg: colorFillAlter,
            },
            Tabs: {
                horizontalItemMargin: '0 24px 0 0',
                horizontalItemPadding: '12px 0',
                inkBarColor: colorPrimary,
                itemSelectedColor: colorPrimary,
            },
            Tag: {
                borderRadiusSM: 4,
            },
            Upload: {
                colorBgContainer: colorBgElevated,
                colorBorder,
            },
        },
    };
};
