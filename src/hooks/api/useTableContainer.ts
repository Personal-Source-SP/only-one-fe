import type {
    IBaseApiNotificationRequest,
    IBaseApiQueryRequest,
    IBaseApiResourceRequest,
} from '@/interfaces';
import { resolveQueryNotifications } from '@/utilities';
import type { useTableProps } from '@refinedev/antd';
import { useTable } from '@refinedev/antd';
import type {
    BaseRecord,
    CrudFilter,
    CrudSort,
    GetListResponse,
    HttpError,
    Pagination,
} from '@refinedev/core';

export interface IUseTableContainerProps<
    TQueryFnData extends BaseRecord = BaseRecord,
    TError extends HttpError = HttpError,
    TData extends BaseRecord = TQueryFnData,
>
    extends
        IBaseApiResourceRequest,
        IBaseApiQueryRequest<
            useTableProps<TQueryFnData, TError, TData, GetListResponse<TData>>['queryOptions']
        >,
        IBaseApiNotificationRequest<GetListResponse<TData>, TError> {
    sorters?: CrudSort[];
    filters?: CrudFilter[];
    pagination?: Pagination;
}

export const useTableContainer = <
    TQueryFnData extends BaseRecord = BaseRecord,
    TError extends HttpError = HttpError,
    TData extends BaseRecord = TQueryFnData,
>(
    props: IUseTableContainerProps<TQueryFnData, TError, TData>,
) => {
    const {
        resource,
        queryOptions,
        pagination,
        sorters,
        filters,
        errorNotification,
        successNotification = false,
    } = props;

    const resolvedNotifications = resolveQueryNotifications<GetListResponse<TData>, TError>({
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
        filters: tableFilters,
        setFilters,
        sorters: tableSorters,
        setSorters,
        tableProps,
        tableQuery,
        isLoading: Boolean(tableQuery?.isLoading),
    };
};
