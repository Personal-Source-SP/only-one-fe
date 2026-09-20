import type { TableProps } from '@/components';
import { useDebounceSearch, useTableChange } from '@/hooks';
import type { IBaseApiNotificationRequest, IBaseApiTransformRequest } from '@/interfaces';
import { applyDataTransform, resolveQueryNotifications, resolveRowKey } from '@/utilities';
import { useTable } from '@refinedev/antd';
import type { BaseRecord, CrudOperators, HttpError } from '@refinedev/core';
import type { Key } from 'react';
import { useCallback, useMemo, useState } from 'react';

type RefineUseTableRequest<TData extends BaseRecord> = NonNullable<
    Parameters<typeof useTable<TData, HttpError>>[0]
>;

export interface ISetFieldFilterOptions {
    /** Tự động chuyển về trang 1 khi lọc (mặc định: true) */
    resetPage?: boolean;
    /** Hành vi cập nhật filter ('merge' giữ các filter khác, 'replace' ghi đè toàn bộ). Mặc định: 'merge' */
    behavior?: 'merge' | 'replace';
}

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

    const handleTableChange = useTableChange<TTransformed>({
        setSorters: result.setSorters,
        setPageSize: result.setPageSize,
        setCurrentPage: result.setCurrentPage,
    });

    const debouncedSearch = useDebounceSearch({
        setFilters: result.setFilters,
        setCurrentPage: result.setCurrentPage,
    });

    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

    const setFieldFilter = useCallback(
        (field: string, value: unknown, options?: ISetFieldFilterOptions) => {
            const { resetPage = true, behavior = 'merge' } = options ?? {};

            if (resetPage) {
                result.setCurrentPage(1);
            }

            if (
                value === undefined ||
                value === null ||
                value === '' ||
                (Array.isArray(value) && value.length === 0)
            ) {
                const currentFilters = result.filters ?? [];
                result.setFilters(
                    currentFilters.filter((f) => 'field' in f && f.field !== field),
                    behavior,
                );
                return;
            }

            const operator: CrudOperators = Array.isArray(value) ? 'in' : 'eq';

            result.setFilters(
                [
                    {
                        field,
                        operator,
                        value,
                    },
                ],
                behavior,
            );
        },
        [result.setCurrentPage, result.setFilters, result.filters],
    );

    const resolvedRowSelection = useMemo(() => {
        if (!enableRowSelection && !rowSelection) return undefined;
        if (rowSelection) return rowSelection;

        return {
            selectedRowKeys,
            onChange: (keys: Key[]) => setSelectedRowKeys(keys),
        };
    }, [enableRowSelection, rowSelection, selectedRowKeys]);

    const customTableProps: TableProps<TTransformed> = useMemo(() => {
        const transformedDataSource = applyDataTransform(
            result.tableProps.dataSource as TData[] | undefined,
            result.tableQuery.data,
            transform,
        );

        return {
            onChange: handleTableChange,
            dataSource: transformedDataSource,
            loading: result.tableProps.loading,
            pagination: result.tableProps.pagination,
            rowKey: (record: TTransformed): string => resolveRowKey(record, rowKey),
            ...(resolvedRowSelection ? { rowSelection: resolvedRowSelection } : {}),
        };
    }, [
        rowKey,
        resolvedRowSelection,
        result.tableQuery.data,
        result.tableProps.loading,
        result.tableProps.dataSource,
        result.tableProps.pagination,
        transform,
        handleTableChange,
    ]);

    const selectionProps = useMemo(() => {
        return {
            selectedRowKeys,
            setSelectedRowKeys,
            selectedCount: selectedRowKeys.length,
            hasSelected: selectedRowKeys.length > 0,
            clearSelection: () => setSelectedRowKeys([]),
        };
    }, [selectedRowKeys]);

    return {
        ...result,
        selectionProps,
        tableProps: customTableProps,
        isLoading: Boolean(result.tableQuery.isLoading),
        setFieldFilter,
        debouncedSearch,
    };
};

export type UseCustomTableResponse<
    TData extends BaseRecord = BaseRecord,
    TTransformed extends BaseRecord = TData,
> = ReturnType<typeof useCustomTable<TData, TTransformed>>;
