import { env } from '@/config';

const toApiBaseUrl = (url: string): string => {
    const trimmed = url.replace(/\/$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

export const getApiBaseUrl = (): string => {
    const url = env.apiUrl;
    if (!url) {
        return '';
    }

    return toApiBaseUrl(url);
};
