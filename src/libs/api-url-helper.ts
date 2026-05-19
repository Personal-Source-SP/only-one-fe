const DEFAULT_API_BASE_URL = 'http://localhost:3004/api/v1';

const toApiBaseUrl = (url?: string): string => {
    if (!url) return DEFAULT_API_BASE_URL;

    const trimmed = url.replace(/\/$/, '');

    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

export const getApiBaseUrl = (): string => {
    if (typeof window === 'undefined') {
        return toApiBaseUrl(process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL);
    }

    return toApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
};
