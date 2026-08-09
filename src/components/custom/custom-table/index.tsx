'use client';

import { useMemo } from 'react';
import { Table } from 'antd';
import type {
    ColumnsType,
    FilterValue,
    SorterResult,
    TableCurrentDataSource,
    TablePaginationConfig,
    TableProps,
} from '@/components/custom/custom-antd-types';
import { CrudSort } from '@refinedev/core';
import { SortOrder } from '@/enums';

type CustomTableProps = {
    loading: boolean;
    columns: ColumnsType<any>;
    tableProps: TableProps<any>;
    currentPage?: number;
    setCurrentPage?: (page: number) => void;
    setPageSize?: (pageSize: number) => void;
    setSorters?: (sorter: CrudSort[]) => void;
    onRowSelectionChange?: (selectedRows: any[]) => void;
    onDisableRowSelection?: (record: any) => boolean;
};

export const CustomTable = ({
    columns,
    loading,
    tableProps,
    currentPage,
    setCurrentPage,
    setPageSize,
    setSorters,
    onRowSelectionChange,
    onDisableRowSelection,
}: CustomTableProps) => {
    const rowSelection: TableProps<any>['rowSelection'] = {
        type: 'checkbox',
        onChange: (_: any[], selectedRows: any[]) => {
            onRowSelectionChange?.(selectedRows);
        },
        getCheckboxProps: (record: any) => ({
            name: record.name,
            disabled: onDisableRowSelection?.(record) || false,
        }),
    };

    const normalizedDataSource = useMemo(() => {
        if (Array.isArray(tableProps?.dataSource)) return tableProps.dataSource;

        if (Array.isArray((tableProps as any)?.dataSource?.data)) {
            return (tableProps as any).dataSource.data;
        }

        return [];
    }, [tableProps?.dataSource]);

    const handleTableChange = (
        pagination: TablePaginationConfig,
        _: Record<string, FilterValue | null>,
        sorterParam: SorterResult<any>,
        __: TableCurrentDataSource<any>,
    ) => {
        if (pagination.current && pagination.pageSize) {
            setPageSize?.(pagination.pageSize);
            setCurrentPage?.(pagination.current);
        }

        if (sorterParam) {
            const currentSorter = Array.isArray(sorterParam) ? sorterParam[0] : sorterParam;
            if (currentSorter && currentSorter.field && currentSorter.order) {
                setSorters?.([
                    {
                        field: String(currentSorter.field),
                        order: currentSorter.order === SortOrder.NEWEST ? 'asc' : 'desc',
                    },
                ]);
            } else {
                setSorters?.([]);
            }
        } else {
            setSorters?.([]);
        }
    };

    return (
        <Table<any>
            {...tableProps}
            className="hub-data-table w-full"
            rowKey="id"
            loading={loading}
            pagination={false}
            columns={columns}
            dataSource={normalizedDataSource}
            rowSelection={onRowSelectionChange ? rowSelection : undefined}
            onChange={(pagination, filters, sorter, extra) =>
                handleTableChange(pagination, filters, sorter as SorterResult<any>, extra)
            }
        />
    );
};
