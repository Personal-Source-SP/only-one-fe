import type { TableProps } from '@/components/custom-antd';
import { useDebounceSearch, useTableChange } from '@/hooks';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications, resolveRowKey } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { BaseRecord, HttpError } from '@refinedev/core';
import type { Key } from 'react';
import { useMemo, useState } from 'react';

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
        enableRowSelection?: boolean;
        rowSelection?: TableProps<TTransformed>['rowSelection'];
        rowKey?: keyof TTransformed | ((record: TTransformed) => string);
    };

export const useCustomTable = <
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
>({
    resource,
    pagination,
    sorters,
    errorNotification,
    successNotification = false,
    rowKey,
    enableRowSelection = false,
    rowSelection,
    transform,
    ...rest
}: UseCustomTableRequest<TData, TTransformed>) => {
    const resolvedNotifications = resolveQueryNotifications({
        resource,
        errorNotification,
        successNotification,
    });

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
        ...resolvedNotifications,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

    const transformedDataSource = useMemo<TTransformed[]>(() => {
        return applyDataTransform(
            result.tableProps.dataSource as TData[] | undefined,
            result.tableQuery.data,
            transform,
        );
    }, [result.tableProps.dataSource, result.tableQuery.data, transform]);

    const resolvedRowSelection = useMemo(() => {
        if (!enableRowSelection && !rowSelection) return undefined;
        if (rowSelection) return rowSelection;
        return {
            selectedRowKeys,
            onChange: (keys: Key[]) => setSelectedRowKeys(keys),
        };
    }, [enableRowSelection, rowSelection, selectedRowKeys]);

    const handleTableChange = useTableChange<TTransformed>({
        setSorters: result.setSorters,
        setPageSize: result.setPageSize,
        setCurrentPage: result.setCurrentPage,
    });

    const debouncedSearch = useDebounceSearch({
        setFilters: result.setFilters,
        setCurrentPage: result.setCurrentPage,
    });

    const customTableProps: TableProps<TTransformed> = {
        pagination: result.tableProps.pagination,
        loading: result.tableProps.loading,
        dataSource: transformedDataSource,
        onChange: handleTableChange,
        rowKey: (record: TTransformed): string => resolveRowKey(record, rowKey),
        ...(resolvedRowSelection ? { rowSelection: resolvedRowSelection } : {}),
    };

    return {
        ...result,
        tableProps: customTableProps,
        isLoading: Boolean(result.tableQuery.isLoading),
        debouncedSearch,
        handleTableChange,
        selectedRowKeys,
        setSelectedRowKeys,
        selectedCount: selectedRowKeys.length,
        hasSelected: selectedRowKeys.length > 0,
        clearSelection: () => setSelectedRowKeys([]),
    };
};

export type UseCustomTableResponse<
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
> = ReturnType<typeof useCustomTable<TData, TTransformed>>;
