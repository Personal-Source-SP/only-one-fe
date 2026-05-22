import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import {
    hasSessionCookieName,
    hasSessionCookieNames,
    usesSecureSessionCookie,
} from '@/libs/auth-session-cookie';
import type { GetServerSidePropsContext } from 'next';
import { cookies, headers } from 'next/headers';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';

const clearSessionCookies = async (): Promise<void> => {
    const cookieStore = await cookies();

    cookieStore.getAll().forEach((cookie) => {
        if (hasSessionCookieName(cookie.name)) {
            cookieStore.delete(cookie.name);
        }
    });
};

export const getSafeServerSession = async (): Promise<Session | null> => {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const allCookies = cookieStore.getAll();
    const cookieNames = allCookies.map((cookie) => cookie.name);

    if (!hasSessionCookieNames(cookieNames)) {
        return null;
    }

    const token = await getToken({
        req: {
            cookies: Object.fromEntries(allCookies.map((cookie) => [cookie.name, cookie.value])),
            headers: Object.fromEntries(headerStore.entries()),
        } as GetServerSidePropsContext['req'],
        secret: authOptions.secret,
        secureCookie: usesSecureSessionCookie(),
    });

    if (!token) {
        await clearSessionCookies();

        return null;
    }

    return getServerSession(authOptions);
};
