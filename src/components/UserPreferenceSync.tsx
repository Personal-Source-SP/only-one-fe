'use client';

import { API_ENDPOINT } from '@/config';
import { resolveHubThemePalette } from '@/constants';
import { useCustomData } from '@/hooks';
import { useThemeStore } from '@/stores';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export const UserPreferenceSync = () => {
    const { status } = useSession();
    const setPalette = useThemeStore((state) => state.setPalette);

    const { data } = useCustomData<{ data: { value?: { palette?: string } } }>({
        method: 'get',
        enabled: status === 'authenticated',
        url: API_ENDPOINT.SETTINGS.USER('appearance'),
        queryOptions: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    });

    useEffect(() => {
        const serverPalette = data?.data?.value?.palette;
        if (serverPalette) {
            setPalette(resolveHubThemePalette(serverPalette));
        }
    }, [data, setPalette]);

    return null;
};
