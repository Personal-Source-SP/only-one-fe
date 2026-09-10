export const safeParseJson = <T = unknown>(value?: string): T | undefined => {
    if (!value || typeof value !== 'string' || !value.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return undefined;
    }
};

export const formatJsonString = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '';
    }
};
