import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthService } from '@/services/google-auth.service';
import { NGoogleAuth } from '@/interfaces';
import { useLocalStorage } from './useLocalStorage';

const googleAuthService = new GoogleAuthService();

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'google_access_token',
    TOKEN_EXPIRY: 'google_token_expiry',
    REFRESH_TOKEN: 'google_refresh_token',
};

export function useGoogleAuth() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [accessToken, setAccessToken] = useLocalStorage<string | null>(STORAGE_KEYS.ACCESS_TOKEN);
    const [tokenExpiry, setTokenExpiry] = useLocalStorage<string | null>(STORAGE_KEYS.TOKEN_EXPIRY);
    const [refreshToken, setRefreshToken] = useLocalStorage<string | null>(
        STORAGE_KEYS.REFRESH_TOKEN,
    );

    const [authState, setAuthState] = useState<NGoogleAuth.IAuthState>({
        error: null,
        tokens: null,
        loading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        loadAuthState();
    }, [accessToken, refreshToken, tokenExpiry]);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            handleOAuthCallback(code);
        }
    }, [searchParams]);

    const saveAuthState = async (tokens: NGoogleAuth.IGoogleTokens) => {
        const expiryTime = Date.now() + tokens.expires_in * 1000 - 5 * 60 * 1000;

        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        setTokenExpiry(expiryTime.toString());

        setAuthState({
            tokens,
            error: null,
            loading: false,
            isAuthenticated: true,
        });
    };

    const clearAuthState = () => {
        setAccessToken(null);
        setTokenExpiry(null);
        setRefreshToken(null);

        setAuthState({
            error: null,
            tokens: null,
            loading: false,
            isAuthenticated: false,
        });
    };

    const loadAuthState = async () => {
        if (!accessToken || !refreshToken) {
            setAuthState((prev) => ({ ...prev, loading: false }));
            return;
        }

        try {
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                const refreshResult = await googleAuthService.refreshAccessToken(refreshToken);

                if (refreshResult && refreshResult.data) {
                    await saveAuthState(refreshResult.data);
                } else {
                    clearAuthState();
                    setAuthState((prev) => ({ ...prev, loading: false }));
                    return;
                }
            } else {
                setAuthState({
                    error: null,
                    loading: false,
                    isAuthenticated: true,
                    tokens: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    } as NGoogleAuth.IGoogleTokens,
                });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);

            clearAuthState();
            setAuthState((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleOAuthCallback = async (code: string) => {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const tokensResult = await googleAuthService.getGoogleTokens(code);

            if (!tokensResult || !tokensResult.data) {
                throw new Error('Failed to get tokens');
            }

            await saveAuthState(tokensResult.data);

            router.push('/dashboard');
        } catch (error) {
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: error instanceof Error ? error.message : 'Authentication failed',
            }));
        }
    };

    const login = (path?: string) => {
        const authUrl = googleAuthService.getGoogleAuthUrl(path);
        window.location.href = authUrl;
    };

    const logout = async () => {
        try {
            if (authState.tokens?.access_token) {
                await googleAuthService.revokeAccess(authState.tokens.access_token);
            }
        } catch (error) {
            console.error('Error revoking access:', error);
        } finally {
            clearAuthState();
            router.push('/login');
        }
    };

    const refreshTokenFn = async () => {
        if (!authState.tokens?.refresh_token) {
            throw new Error('No refresh token available');
        }

        const result = await googleAuthService.refreshAccessToken(authState.tokens.refresh_token);
        if (result && result.data) {
            await saveAuthState(result.data);
        } else {
            throw new Error('Failed to refresh token');
        }
    };

    return {
        ...authState,
        login,
        logout,
        refreshToken: refreshTokenFn,
        clearError: () => setAuthState((prev) => ({ ...prev, error: null })),
    };
}
