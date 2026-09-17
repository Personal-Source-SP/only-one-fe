import type { BaseRecord } from '@refinedev/core';

export const getDefaultOptionValue = <T extends BaseRecord>(item: T): string => {
    return String(item.id ?? '');
};

export const getDefaultOptionLabel = <T extends BaseRecord>(item: T): string => {
    const record = item as Record<string, unknown>;
    if (typeof record.name === 'string') return record.name;
    if (typeof record.title === 'string') return record.title;
    if (typeof record.label === 'string') return record.label;
    return String(item.id ?? '');
};
