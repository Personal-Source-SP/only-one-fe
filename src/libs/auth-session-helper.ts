import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { hasSessionCookieNames, usesSecureSessionCookie } from '@/libs/auth-session-cookie';
import type { GetServerSidePropsContext } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';

const SESSION_CLEANUP_PATH = '/auth/cleanup-session';

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
        const searchParams = new URLSearchParams({
            callbackUrl: '/login',
        });

        redirect(`${SESSION_CLEANUP_PATH}?${searchParams.toString()}`);
    }

    return getServerSession(authOptions);
};
