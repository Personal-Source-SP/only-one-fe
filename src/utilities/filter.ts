import type { CrudFilters } from '@refinedev/core';

export const toOptionalFilter = (field: string, value: unknown): CrudFilters[number] | null => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return {
        field,
        value,
        operator: 'eq',
    };
};
