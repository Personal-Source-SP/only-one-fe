'use client';

import {
    HUB_THEME_PALETTE,
    HUB_THEME_STORAGE_KEY,
    HubThemePalette,
    resolveHubThemePalette,
} from '@/constants';
import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';

type HubThemePaletteContextValue = {
    palette: HubThemePalette;
    setPalette: (palette: HubThemePalette) => void;
};

const HubThemePaletteContext = createContext<HubThemePaletteContextValue | undefined>(undefined);

const applyHubThemePalette = (palette: HubThemePalette) => {
    document.documentElement.setAttribute('data-hub-theme', palette);
};

const readStoredHubThemePalette = (): HubThemePalette => {
    try {
        const raw = window.localStorage.getItem(HUB_THEME_STORAGE_KEY);
        if (!raw) {
            return HUB_THEME_PALETTE;
        }

        return resolveHubThemePalette(JSON.parse(raw));
    } catch {
        return HUB_THEME_PALETTE;
    }
};

export const HubThemePaletteProvider = ({ children }: PropsWithChildren) => {
    const [palette, setPaletteState] = useState<HubThemePalette>(HUB_THEME_PALETTE);

    useLayoutEffect(() => {
        const resolved = readStoredHubThemePalette();
        applyHubThemePalette(resolved);
        setPaletteState(resolved);
    }, []);

    const setPalette = useCallback((next: HubThemePalette) => {
        window.localStorage.setItem(HUB_THEME_STORAGE_KEY, JSON.stringify(next));
        applyHubThemePalette(next);
        setPaletteState(next);
    }, []);

    const value = useMemo(
        () => ({
            palette,
            setPalette,
        }),
        [palette, setPalette],
    );

    return (
        <HubThemePaletteContext.Provider value={value}>{children}</HubThemePaletteContext.Provider>
    );
};

export const useHubThemePalette = () => {
    const context = useContext(HubThemePaletteContext);

    if (context === undefined) {
        throw new Error('useHubThemePalette must be used within HubThemePaletteProvider');
    }

    return context;
};
