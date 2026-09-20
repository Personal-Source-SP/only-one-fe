'use client';

import { PropsWithChildren, useLayoutEffect, useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';

import { buildHubAntdTheme, CustomApp } from '@/components/custom-antd';
import { plusJakartaSans } from '@/constants';
import { useThemeStore } from '@/stores';

export const HubThemedConfigProvider = ({ children }: PropsWithChildren) => {
    const palette = useThemeStore((state) => state.palette);
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
