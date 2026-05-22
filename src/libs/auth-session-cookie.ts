export const SESSION_COOKIE_PREFIXES = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
] as const;

export const usesSecureSessionCookie = (): boolean => {
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    return nextAuthUrl?.startsWith('https://') ?? !!process.env.VERCEL;
};

export const hasSessionCookieName = (cookieName: string): boolean =>
    SESSION_COOKIE_PREFIXES.some((prefix) => cookieName.startsWith(prefix));

export const hasSessionCookieNames = (cookieNames: string[]): boolean =>
    cookieNames.some(hasSessionCookieName);
