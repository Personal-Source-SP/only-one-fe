/**
 * Resolves full API URL with base URL fallback.
 */
export const resolveApiUrl = (url: string, apiUrl: string): string => {
    return url.startsWith('http') || url.startsWith('/') ? url : `${apiUrl}/${url}`;
};
