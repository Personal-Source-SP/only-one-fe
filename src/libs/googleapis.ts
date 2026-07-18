import { GOOGLE_SCOPES } from '@/constants';
import { NGoogle } from '@/interfaces';
import axios from 'axios';

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
): Promise<NGoogle.IGoogleExchangeCodeRequest | null> => {
    const res = await axios.post('/api/google/exchange-token', {
        code,
        redirectUri,
    });

    if (res.status !== 200) {
        return null;
    }

    return res.data as NGoogle.IGoogleExchangeCodeRequest;
};

/**
 * Refresh access token.
 * NOTE: Hiện tại chưa có caller trong codebase. Nếu cần dùng, tạo server-side API Route
 * tương tự exchange-token để tránh lộ GOOGLE_CLIENT_SECRET.
 * TODO: Chuyển hàm này sang sử dụng /api/google/refresh-token khi có caller.
 */
export const refreshAccessToken = async (
    refreshToken: string,
): Promise<NGoogle.IGoogleExchangeCodeRequest | null> => {
    // TODO: Move to server-side API Route to avoid exposing GOOGLE_CLIENT_SECRET.
    // See: src/app/api/google/exchange-token/route.ts as reference.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '';

    const body = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
    });

    const res = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (res.status !== 200) {
        return null;
    }

    return res.data as NGoogle.IGoogleExchangeCodeRequest;
};

export const getUserInfoFromGoogle = async (
    accessToken: string,
): Promise<NGoogle.IGoogleUserInfo | null> => {
    try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (res.status !== 200) {
            return null;
        }

        return res.data as NGoogle.IGoogleUserInfo;
    } catch {
        return null;
    }
};
