import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    mode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            setMode: (mode) => set({ mode }),
        }),
        {
            name: 'theme-storage',
        },
    ),
);
