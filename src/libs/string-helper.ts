export const buildUrl = (query: string, baseUrl: string): string => {
    const encodedQuery = encodeURIComponent(query);
    if (baseUrl.startsWith('http')) return `${baseUrl}${encodedQuery}`;

    const cleanPath = encodedQuery.startsWith('/') ? encodedQuery : `/${encodedQuery}`;
    return `${baseUrl}${cleanPath}`;
};

export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const slugify = (text: string, maxLength?: number): string => {
    if (!text) return '';

    let slug = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');

    if (maxLength && slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
    }

    return slug.replace(/^-+|-+$/g, '');
};
