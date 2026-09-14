import { HUB_THEME_PALETTE, HubThemePalette, resolveHubThemePalette } from '@/constants';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyHubThemePalette = (palette: HubThemePalette) => {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-hub-theme', palette);
    }
};

interface ThemeState {
    mode: 'light' | 'dark';
    palette: HubThemePalette;
    setMode: (mode: 'light' | 'dark') => void;
    setPalette: (palette: HubThemePalette) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            palette: HUB_THEME_PALETTE,
            setMode: (mode) => set({ mode }),
            setPalette: (palette) => {
                const resolved = resolveHubThemePalette(palette);
                applyHubThemePalette(resolved);
                set({ palette: resolved });
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state?.palette) {
                    applyHubThemePalette(state.palette);
                }
            },
        },
    ),
);
