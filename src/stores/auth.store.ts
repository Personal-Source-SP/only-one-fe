import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type AuthStore = {
    token: string;
    clearToken: () => void;
    setToken: (token: string) => void;
};

export const useAuthStore = createStore<AuthStore>()(
    persist(
        immer((set) => ({
            token: '',
            setToken: (token: string) =>
                set((state) => {
                    state.token = token;
                }),
            clearToken: () =>
                set((state) => {
                    state.token = '';
                }),
        })),
        {
            name: 'auth_token',
            partialize: (state) => ({ token: state.token }),
        },
    ),
);
