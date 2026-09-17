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
    sorters?: CrudSort[];
    filters?: CrudFilter[];
    pagination?: Pagination;
}

export const useTableContainer = (props: IUseTableContainerProps) => {
    const {
        resource,
        queryOptions,
        pagination,
        sorters,
        filters,
        errorNotification,
        successNotification = false,
    } = props;

    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorNotification,
        successNotification,
    });

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        filters: tableFilters,
        setFilters,
        sorters: tableSorters,
        setSorters,
        tableQuery,
        tableProps,
    } = useTable({
        resource,
        syncWithLocation: false,
        pagination: pagination ?? {
            pageSize: 10,
            mode: 'server',
        },
        sorters: sorters
            ? {
                  mode: 'server',
                  initial: sorters,
              }
            : {
                  mode: 'server',
                  initial: [{ field: 'createdAt', order: 'desc' }],
              },
        filters: {
            mode: 'server',
            initial: filters ?? [],
        },
        queryOptions,
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
