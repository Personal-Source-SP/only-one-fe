import { hasSessionCookieName, usesSecureSessionCookie } from '@/libs/auth-session-cookie';
import { logger } from '@/utilities/logger';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const clearSessionCookies = (request: NextRequest, response: NextResponse): NextResponse => {
    request.cookies.getAll().forEach((cookie) => {
        if (hasSessionCookieName(cookie.name)) {
            response.cookies.delete(cookie.name);
        }
    });

    return response;
};

export const proxy = async (request: NextRequest) => {
    const startTime = performance.now();
    let response: NextResponse = NextResponse.next();

    const hasSessionCookie = request.cookies
        .getAll()
        .some((cookie) => hasSessionCookieName(cookie.name));

    if (hasSessionCookie) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: usesSecureSessionCookie(),
        });

        if (!token) {
            response = clearSessionCookies(request, NextResponse.next());
        }
    }

    const durationMs = Math.round(performance.now() - startTime);
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '::1';

    logger.logHttpRequest({
        ip,
        method: request.method,
        url: request.nextUrl.pathname + request.nextUrl.search,
        status: response.status,
        durationMs,
    });

    return response;
};

export const middleware = proxy;

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
