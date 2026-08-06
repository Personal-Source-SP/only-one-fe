'use client';

import { useCallback } from 'react';
import { HubThemePalette } from '@/constants';
import { useHubThemePalette } from '@/contexts/HubThemePaletteContext';

export const useSettingAppearancePage = () => {
    const { palette, setPalette } = useHubThemePalette();

    const handleSelectPalette = useCallback(
        (next: HubThemePalette) => {
            setPalette(next);
        },
        [setPalette],
    );

    return {
        palette,
        handleSelectPalette,
    };
};
