import { useTable } from '@refinedev/antd';
import { CrudFilter, CrudSort, Pagination } from '@refinedev/core';

export const useTableContainer = (props: {
    resource: string;
    enabled?: boolean;
    defaultSorters?: CrudSort[];
    defaultFilters?: CrudFilter[];
    defaultPagination?: Pagination;
}) => {
    const { resource, enabled, defaultPagination, defaultSorters, defaultFilters } = props;

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        filters,
        setFilters,
        sorters,
        setSorters,
        tableQuery,
        tableProps,
    } = useTable({
        resource,
        syncWithLocation: false,
        pagination: defaultPagination
            ? defaultPagination
            : {
                  pageSize: 10,
                  mode: 'server',
              },
        sorters: defaultSorters
            ? {
                  mode: 'server',
                  initial: defaultSorters,
              }
            : {
                  mode: 'server',
                  initial: [{ field: 'createdAt', order: 'desc' }],
              },
        filters: {
            mode: 'server',
            initial: defaultFilters ?? [],
        },
        queryOptions: {
            enabled: enabled ?? true,
        },
    });

    return {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        filters,
        setFilters,
        sorters,
        setSorters,
        tableProps,
        tableQuery,
    };
};
