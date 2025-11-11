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
