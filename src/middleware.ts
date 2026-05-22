import { hasSessionCookieName, usesSecureSessionCookie } from '@/libs/auth-session-cookie';
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

export const middleware = async (request: NextRequest) => {
    const hasSessionCookie = request.cookies
        .getAll()
        .some((cookie) => hasSessionCookieName(cookie.name));

    if (!hasSessionCookie) {
        return NextResponse.next();
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: usesSecureSessionCookie(),
    });

    if (!token) {
        return clearSessionCookies(request, NextResponse.next());
    }

    return NextResponse.next();
};

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
