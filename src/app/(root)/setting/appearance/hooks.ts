'use client';

import { useCallback } from 'react';

import { API_ENDPOINT } from '@/config';
import { HubThemePalette } from '@/constants';
import { useCustomMutationData } from '@/hooks';
import { useThemeStore } from '@/stores';

export const useSettingAppearancePage = () => {
    const palette = useThemeStore((state) => state.palette);
    const setPalette = useThemeStore((state) => state.setPalette);

    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const handleSelectPalette = useCallback(
        (next: HubThemePalette) => {
            setPalette(next);
            handleCustomMutationData({
                method: 'put',
                values: { value: { palette: next } },
                url: API_ENDPOINT.SETTINGS.USER('appearance'),
                successNotification: {
                    type: 'success',
                    message: 'Cập nhật giao diện thành công',
                },
            });
        },
        [setPalette, handleCustomMutationData],
    );

    return {
        palette,
        handleSelectPalette,
        isSyncing: mutation.mutation.isPending,
    };
};
