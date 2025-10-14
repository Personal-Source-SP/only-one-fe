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
    return expiresAt.getTime() <= now + 30 * 1000;
};

export const exchangeCodeForTokens = async (
    code: string,
    redirectUri: string,
): Promise<NGoogle.IGoogleExchangeCodeRequest | null> => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '';

    const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    });

    const res = await axios.post('https://oauth2.googleapis.com/token', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (res.status !== 200) {
        return null;
    }

    return res.data as NGoogle.IGoogleExchangeCodeRequest;
};

export const refreshAccessToken = async (
    refreshToken: string,
): Promise<NGoogle.IGoogleExchangeCodeRequest | null> => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

    const body = new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
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
