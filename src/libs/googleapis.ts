import { GOOGLE_SCOPES } from '@/constants';
import axios from 'axios';

export interface IGoogleExchangeCodeRequest {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
    refresh_token?: string;
    refresh_token_expires_in?: number;
}

export interface IGoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export const getGoogleAuthUrl = (): string => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || '';

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: GOOGLE_SCOPES.join(' '),
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const isExpiredToken = (expiresAt: Date): boolean => {
    const now = Date.now();

    return new Date(expiresAt).getTime() <= now + 30 * 1000;
};

/**
 * Exchange OAuth authorization code lấy tokens.
 * Gọi qua server-side API Route /api/google/exchange-token để GOOGLE_CLIENT_SECRET
 * không bao giờ xuất hiện trong client-side bundle.
 */
export const exchangeCodeForTokens = async (
    code: string,
    redirectUri: string,
): Promise<IGoogleExchangeCodeRequest | null> => {
    const res = await axios.post('/api/google/exchange-token', {
        code,
        redirectUri,
    });

    if (res.status !== 200) {
        return null;
    }

    return res.data as IGoogleExchangeCodeRequest;
};

export const refreshAccessToken = async (
    refreshToken: string,
): Promise<IGoogleExchangeCodeRequest | null> => {
    const res = await axios.post('/api/google/refresh-token', {
        refreshToken,
    });

    if (res.status !== 200) {
        return null;
    }

    return res.data as IGoogleExchangeCodeRequest;
};

export const getGoogleUserInfo = async (accessToken: string): Promise<IGoogleUserInfo | null> => {
    try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (res.status !== 200) {
            return null;
        }

        return res.data as IGoogleUserInfo;
    } catch {
        return null;
    }
};

export const getUserInfoFromGoogle = getGoogleUserInfo;
