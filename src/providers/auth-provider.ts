import { AuthProvider } from '@refinedev/core';
import { signIn, signOut } from 'next-auth/react';

export const authProvider: AuthProvider = {
    register: async ({ providerName, email, password, recaptchaToken }) => {
        const signUpResponse = await signIn('CredentialsSignUp', {
            email,
            password,
            recaptchaToken,
            callbackUrl: '/',
            redirect: true,
        });

        if (!signUpResponse) {
            return {
                success: false,
            };
        }

        const { ok, error } = signUpResponse;

        if (ok) {
            return {
                success: true,
                redirectTo: '/',
            };
        }

        return {
            success: false,
            error: new Error(error?.toString()),
        };
    },
    login: async ({ providerName, email, password, recaptchaToken }) => {
        if (providerName) {
            signIn(providerName, {
                callbackUrl: '/',
                redirect: true,
            });

            return {
                success: true,
            };
        }

        const signInResponse = await signIn('credentials', {
            email,
            password,
            recaptchaToken,
            callbackUrl: '/',
            redirect: false,
        });

        if (!signInResponse) {
            return {
                success: false,
                error: new Error('Invalid credentials'),
            };
        }

        const { ok, error } = signInResponse;

        if (ok) {
            return {
                success: true,
                redirectTo: '/',
            };
        }

        const errorMessage = error?.toString() || '';
        if (errorMessage) {
            return {
                success: false,
                error: new Error(errorMessage),
            };
        }

        return {
            success: false,
            error: new Error('Invalid credentials'),
        };
    },
    logout: async () => {
        signOut({
            redirect: true,
            callbackUrl: '/login',
        });

        return {
            success: true,
        };
    },
    onError: async (error) => {
        if (error.response?.status === 401) {
            return {
                logout: true,
            };
        }

        return {
            error,
        };
    },
    check: async ({ status }) => {
        if (status === 'unauthenticated') {
            return {
                authenticated: false,
                redirectTo: '/login',
            };
        }

        return {
            authenticated: true,
        };
    },
    getPermissions: async () => {
        return [];
    },
    getIdentity: async () => {
        return null;
    },
};
