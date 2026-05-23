'use client';

import { CustomApp, buildHubAntdTheme } from '@/components/custom';
import { plusJakartaSans } from '@/constants';
import { useHubThemePalette } from '@/contexts/HubThemePaletteContext';
import { ConfigProvider } from 'antd';
import { PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react';

export const HubThemedConfigProvider = ({ children }: PropsWithChildren) => {
    const { palette } = useHubThemePalette();
    const [antdTheme, setAntdTheme] = useState(buildHubAntdTheme);

    useLayoutEffect(() => {
        setAntdTheme(buildHubAntdTheme());
    }, [palette]);

    const themeConfig = useMemo(
        () => ({
            ...antdTheme,
            token: {
                ...antdTheme.token,
                fontFamily: `${plusJakartaSans.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
            },
        }),
        [antdTheme],
    );

    return (
        <ConfigProvider theme={themeConfig}>
            <CustomApp>{children}</CustomApp>
        </ConfigProvider>
    );
};
