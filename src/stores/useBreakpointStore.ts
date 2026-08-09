import { create } from 'zustand';
import type { Breakpoint } from '@/components/custom-antd';

type Screens = Partial<Record<Breakpoint, boolean>>;

interface BreakpointState {
    screens: Screens;
    isMobile: boolean;
    isBelowLg: boolean;
    setScreens: (screens: Screens) => void;
}

export const useBreakpointStore = create<BreakpointState>()((set) => ({
    screens: {},
    isMobile: false,
    isBelowLg: false,
    setScreens: (screens) =>
        set({
            screens,
            isMobile: !screens.md,
            isBelowLg: !screens.lg,
        }),
}));
