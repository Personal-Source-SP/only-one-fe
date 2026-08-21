import type { CrudSorting } from '@refinedev/core';

export const DEFAULT_ORDER_BY = 'createdAt';
export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORTERS: CrudSorting = [{ field: DEFAULT_ORDER_BY, order: 'desc' }];
