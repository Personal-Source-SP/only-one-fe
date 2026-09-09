const DEFAULT_API_URL = 'http://localhost:3001/api';
const DEFAULT_APP_NAME = 'Only One Hub';
const DEFAULT_APP_LOGO_SRC = '/images/logo.png';
const DEFAULT_AUTH_TOKEN_KEY = 'google_access_token';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const readEnvString = (value: string | undefined, fallback: string) => {
    const normalizedValue = value?.trim();
    return normalizedValue ? normalizedValue : fallback;
};

export const env = {
    apiUrl: trimTrailingSlash(readEnvString(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL)),
    appName: readEnvString(process.env.NEXT_PUBLIC_APP_NAME, DEFAULT_APP_NAME),
    appLogoSrc: readEnvString(process.env.NEXT_PUBLIC_APP_LOGO_SRC, DEFAULT_APP_LOGO_SRC),
    notificationUrl: readEnvString(process.env.NEXT_PUBLIC_NOTIFICATION_URL, ''),
    socketUrl: readEnvString(process.env.NEXT_PUBLIC_SOCKET_URL, ''),
    googleClientId: readEnvString(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, ''),
    googleRedirectUri: readEnvString(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI, ''),
    authTokenKey: DEFAULT_AUTH_TOKEN_KEY,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
} as const;

export const appBrand = {
    appName: env.appName,
    brandName: `${env.appName}`,
    description: `${env.appName} Portal`,
    documentTitleSuffix: ` | ${env.appName}`,
    usersLabel: `${env.appName} users`,
    viUsersLabel: `Người dùng ${env.appName}`,
} as const;

export const applyDocumentBranding = () => {
    if (typeof document === 'undefined') {
        return;
    }

    document.title = appBrand.appName;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute('content', appBrand.description);
};
