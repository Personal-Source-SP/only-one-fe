import { getErrorNotification, NotificationAction } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useDebounceSearch, useTableChange } from '@/hooks';

type RefineUseTableRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useTable<TData, HttpError>>[0]
>;

export type UseCustomTableRequest<TData extends BaseRecord> = Omit<
    RefineUseTableRequest<TData>,
    'resource'
> & {
    resource: string;
    errorMessage?: string;
    successMessage?: string;
    rowKey?: keyof TData | ((record: TData) => string);
};

export const useCustomTable = <TData extends BaseRecord>({
    resource,
    errorMessage,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    rowKey,
    ...rest
}: UseCustomTableRequest<TData>) => {
    const result = useTable<TData, HttpError>({
        ...rest,
        resource,
        pagination: {
            pageSize: 10,
            currentPage: 1,
            ...pagination,
        },
        sorters: {
            initial: [{ field: 'createdAt', order: 'desc' }],
            ...sorters,
        },
        errorNotification: getErrorNotification({
            resource,
            errorNotification,
            message: errorMessage,
            action: NotificationAction.Load,
        }),
        successNotification,
    });

    const { handleTableChange } = useTableChange<TData>({
        setSorters: result.setSorters,
        setPageSize: result.setPageSize,
        setCurrentPage: result.setCurrentPage,
    });

    const debouncedSearch = useDebounceSearch({
        setFilters: result.setFilters,
        setCurrentPage: result.setCurrentPage,
    });

    return {
        ...result,
        debouncedSearch,
        handleTableChange,
        tableProps: {
            ...result.tableProps,
            onChange: handleTableChange,
            rowKey: (record: TData): string => {
                if (typeof rowKey === 'function') {
                    return rowKey(record);
                }

                if (rowKey) {
                    return String(record[rowKey]);
                }

                return String((record as any).id ?? (record as any)._id ?? '');
            },
        },
    };
};
