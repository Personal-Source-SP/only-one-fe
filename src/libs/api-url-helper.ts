const toApiBaseUrl = (url: string): string => {
    const trimmed = url.replace(/\/$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

export const getApiBaseUrl = (): string => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) throw new Error('NEXT_PUBLIC_API_URL is not defined');

    return toApiBaseUrl(url);
};
