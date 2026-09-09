import { useMemo } from 'react';
import { getErrorNotification, NotificationAction } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useDebounceSearch, useTableChange } from '@/hooks';

type RefineUseTableRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useTable<TData, HttpError>>[0]
>;

export type UseCustomTableRequest<
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
> = Omit<RefineUseTableRequest<TData>, 'resource'> & {
    resource: string;
    errorMessage?: string;
    successMessage?: string;
    rowKey?: keyof TTransformed | ((record: TTransformed) => string);
    transform?: (data: TData[]) => TTransformed[];
};

export const useCustomTable = <
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
>({
    resource,
    errorMessage,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    rowKey,
    transform,
    ...rest
}: UseCustomTableRequest<TData, TTransformed>) => {
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

    const rawDataSource = (result.tableProps.dataSource ?? []) as TData[];
    const transformedDataSource = useMemo<TTransformed[]>(() => {
        if (transform) {
            return transform(rawDataSource);
        }
        return rawDataSource as unknown as TTransformed[];
    }, [rawDataSource, transform]);

    return {
        ...result,
        debouncedSearch,
        handleTableChange,
        tableProps: {
            ...result.tableProps,
            dataSource: transformedDataSource,
            onChange: handleTableChange,
            rowKey: (record: TTransformed): string => {
                if (typeof rowKey === 'function') {
                    return rowKey(record);
                }

                if (rowKey) {
                    return String(record[rowKey]);
                }

                return String(record.id ?? (record as Record<string, unknown>)._id ?? '');
            },
        },
    };
};
