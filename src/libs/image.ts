export const getProxyUrl = (url: string) => {
    if (!url) return '';
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};
