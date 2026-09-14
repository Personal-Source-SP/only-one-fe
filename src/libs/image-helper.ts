export const getProxyUrl = (url: string): string => {
    if (!url) return '';
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export const isLocalFilePath = (path: string | undefined): boolean => {
    if (!path) return false;

    return !(
        path.startsWith('http://') ||
        path.startsWith('https://') ||
        path.startsWith('blob:') ||
        path.startsWith('file://') ||
        path.startsWith('/')
    );
};
