import { hasSessionCookieName } from '@/libs/auth-session-cookie';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const DEFAULT_CALLBACK_URL = '/login';

const getCallbackUrl = (request: NextRequest): URL => {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');

    if (!callbackUrl?.startsWith('/')) {
        return new URL(DEFAULT_CALLBACK_URL, request.url);
    }

    return new URL(callbackUrl, request.url);
};

export const GET = (request: NextRequest) => {
    const response = NextResponse.redirect(getCallbackUrl(request));

    request.cookies.getAll().forEach((cookie) => {
        if (hasSessionCookieName(cookie.name)) {
            response.cookies.delete(cookie.name);
        }
    });

    return response;
};
