import type {
    IBaseApiNotificationRequest,
    IBaseApiQueryRequest,
    IBaseApiResourceRequest,
} from '@/interfaces';
import { resolveQueryNotifications } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { CrudFilter, CrudSort, Pagination } from '@refinedev/core';

export interface IUseTableContainerProps
    extends IBaseApiResourceRequest, IBaseApiQueryRequest, IBaseApiNotificationRequest {
    defaultSorters?: CrudSort[];
    defaultFilters?: CrudFilter[];
    defaultPagination?: Pagination;
}

export const useTableContainer = (props: IUseTableContainerProps) => {
    const {
        resource,
        enabled,
        queryOptions,
        defaultPagination,
        defaultSorters,
        defaultFilters,
        errorMessage,
        errorDescription,
        errorNotification,
        successNotification = false,
    } = props;

    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorMessage,
        errorDescription,
        errorNotification,
        successNotification,
    });

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
        pagination: defaultPagination ?? {
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
            ...queryOptions,
        },
        ...resolvedNotifications,
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
