import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthService } from '@/services/google-auth.service';
import { NGoogleAuth } from '@/interfaces';

const googleAuthService = new GoogleAuthService();

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'google_access_token',
    REFRESH_TOKEN: 'google_refresh_token',
    USER_PROFILE: 'google_user_profile',
    PERMISSIONS: 'google_permissions',
    TOKEN_EXPIRY: 'google_token_expiry',
};

export function useGoogleAuth() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [authState, setAuthState] = useState<NGoogleAuth.IAuthState>({
        isAuthenticated: false,
        user: null,
        tokens: null,
        permissions: null,
        loading: true,
        error: null,
    });

    // Load auth state from localStorage on mount
    useEffect(() => {
        loadAuthState();
    }, []);

    // Handle OAuth callback
    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            handleOAuthCallback(code);
        }
    }, [searchParams]);

    const loadAuthState = useCallback(async () => {
        try {
            const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            const userProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            const permissions = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
            const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

            if (!accessToken || !refreshToken) {
                setAuthState((prev) => ({ ...prev, loading: false }));
                return;
            }

            // Check if token is expired
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                // Try to refresh token
                const refreshResult = await googleAuthService.refreshAccessToken(refreshToken);
                if (refreshResult.success && refreshResult.data) {
                    await saveAuthState(refreshResult.data, JSON.parse(userProfile || 'null'));
                } else {
                    // Refresh failed, clear auth state
                    clearAuthState();
                    setAuthState((prev) => ({ ...prev, loading: false }));
                    return;
                }
            } else {
                // Token is still valid
                const parsedUser = userProfile ? JSON.parse(userProfile) : null;
                const parsedPermissions = permissions ? JSON.parse(permissions) : null;

                setAuthState({
                    isAuthenticated: true,
                    user: parsedUser,
                    tokens: {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    } as NGoogleAuth.IGoogleTokens,
                    permissions: parsedPermissions,
                    loading: false,
                    error: null,
                });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            clearAuthState();
            setAuthState((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    const handleOAuthCallback = useCallback(
        async (code: string) => {
            setAuthState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                // Get tokens from authorization code
                const tokensResult = await googleAuthService.getGoogleTokens(code);

                if (!tokensResult.success || !tokensResult.data) {
                    throw new Error('Failed to get tokens');
                }

                const { access_token, refresh_token } = tokensResult.data;

                // Get user profile
                const userProfile = await googleAuthService.getUserProfile(access_token);
                if (!userProfile) {
                    throw new Error('Failed to get user profile');
                }

                // Check user permissions
                const permissions = await googleAuthService.checkUserPermissions(access_token);

                // Save auth state
                await saveAuthState(tokensResult.data, userProfile, permissions);

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('OAuth callback error:', error);
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Authentication failed',
                }));
            }
        },
        [router],
    );

    const saveAuthState = useCallback(
        async (
            tokens: NGoogleAuth.IGoogleTokens,
            user: NGoogleAuth.IGoogleUserProfile,
            permissions?: NGoogleAuth.IUserPermissions,
        ) => {
            // Calculate token expiry (subtract 5 minutes for safety)
            const expiryTime = Date.now() + tokens.expires_in * 1000 - 5 * 60 * 1000;

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());

            if (permissions) {
                localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
            }

            // Update state
            setAuthState({
                isAuthenticated: true,
                user,
                tokens,
                permissions: permissions || null,
                loading: false,
                error: null,
            });
        },
        [],
    );

    const clearAuthState = useCallback(() => {
        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });

        // Update state
        setAuthState({
            isAuthenticated: false,
            user: null,
            tokens: null,
            permissions: null,
            loading: false,
            error: null,
        });
    }, []);

    const login = useCallback(() => {
        const authUrl = googleAuthService.getGoogleAuthUrl();
        window.location.href = authUrl;
    }, []);

    const logout = useCallback(async () => {
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
    }, [authState.tokens, clearAuthState, router]);

    const refreshToken = useCallback(async () => {
        if (!authState.tokens?.refresh_token) {
            throw new Error('No refresh token available');
        }

        const result = await googleAuthService.refreshAccessToken(authState.tokens.refresh_token);
        if (result.success && result.data && authState.user) {
            await saveAuthState(result.data, authState.user, authState.permissions);
        } else {
            throw new Error('Failed to refresh token');
        }
    }, [authState.tokens, authState.user, authState.permissions, saveAuthState]);

    const checkPermissions = useCallback(async () => {
        if (!authState.tokens?.access_token) {
            return null;
        }

        const permissions = await googleAuthService.checkUserPermissions(
            authState.tokens.access_token,
        );

        // Update permissions in state and localStorage
        setAuthState((prev) => ({ ...prev, permissions }));
        localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));

        return permissions;
    }, [authState.tokens]);

    return {
        ...authState,
        login,
        logout,
        refreshToken,
        checkPermissions,
        clearError: () => setAuthState((prev) => ({ ...prev, error: null })),
    };
}
