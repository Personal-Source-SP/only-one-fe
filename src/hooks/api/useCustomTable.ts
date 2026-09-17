import { useDebounceSearch, useTableChange } from '@/hooks';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryErrorNotification } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';
import { useMemo } from 'react';

type RefineUseTableRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useTable<TData, HttpError>>[0]
>;

export type UseCustomTableRequest<
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
> = Omit<RefineUseTableRequest<TData>, 'resource' | 'errorNotification' | 'successNotification'> &
    IBaseApiNotificationRequest &
    IBaseApiTransformRequest<TData[], TTransformed[]> & {
        resource: string;
        rowKey?: keyof TTransformed | ((record: TTransformed) => string);
    };

export const useCustomTable = <
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
>({
    resource,
    errorMessage,
    errorDescription,
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
        errorNotification: resolveQueryErrorNotification({
            resource,
            errorNotification,
            errorMessage,
            errorDescription,
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
        return applyDataTransform(rawDataSource, undefined, transform);
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
