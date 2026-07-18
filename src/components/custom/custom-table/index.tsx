'use client';

import { useMainContext } from '@/contexts/MainContext';
import { MessageType, SortOrder } from '@/enums';
import { ActionTableItem, NBaseApi } from '@/interfaces';
import { DeleteOutlined } from '@ant-design/icons';
import { CrudSort, useDelete } from '@refinedev/core';
import { Table } from 'antd';
import { CustomButton } from '@/components/custom/custom-button';
import { CustomPopconfirm } from '@/components/custom/custom-popconfirm';
import { CustomSpace } from '@/components/custom/custom-space';
import type {
    ColumnsType,
    FilterValue,
    SorterResult,
    TableCurrentDataSource,
    TablePaginationConfig,
    TableProps,
} from '@/components/custom/custom-antd-types';
import { useMemo } from 'react';

type CustomTableProps = {
    loading: boolean;
    columns: ColumnsType<any>;
    tableProps: TableProps<any>;
    resource?: string;
    currentPage?: number;
    actionItems?: ActionTableItem[];
    setCurrentPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSorters: (sorter: CrudSort[]) => void;
    onRefetch?: () => void;
    onRowSelectionChange?: (selectedRows: any[]) => void;
    onDisableRowSelection?: (record: any) => boolean;
};

export const CustomTable = ({
    columns,
    loading,
    tableProps,
    resource,
    currentPage,
    actionItems,
    setCurrentPage,
    setPageSize,
    setSorters,
    onRefetch,
    onRowSelectionChange,
    onDisableRowSelection,
}: CustomTableProps) => {
    const { handleMessage } = useMainContext();

    const { mutate: deleteRecord } = useDelete<NBaseApi.IResponse<boolean>>();

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

    const normalizedColumns: ColumnsType<any> = useMemo(() => {
        if (!actionItems?.length && !resource) return columns;

        return [
            ...columns,
            {
                width: 200,
                key: 'action',
                fixed: 'right',
                align: 'center',
                title: 'Hành động',
                dataIndex: 'action',
                render: (_: any, record: any) => renderAction(record),
            },
        ];
    }, [columns, actionItems, resource]);

    const handleDelete = (record: any) => {
        deleteRecord(
            {
                id: record.id,
                resource: resource || '',
                errorNotification: false,
                successNotification: false,
            },
            {
                onSuccess: () => {
                    handleMessage({
                        content: 'Xóa dữ liệu thành công',
                    });

                    if (currentPage && currentPage > 1 && tableProps.dataSource?.length === 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        onRefetch?.();
                    }
                },
                onError: (error) => {
                    handleMessage({
                        type: MessageType.ERROR,
                        content: error?.message || 'Lỗi xóa dữ liệu không thành công',
                    });
                },
            },
        );
    };

    const renderAction = (record: any) => {
        return (
            <CustomSpace direction="horizontal" size={4}>
                {actionItems?.map((action) => (
                    <CustomButton
                        type="text"
                        size="small"
                        icon={action.icon}
                        title={action.label}
                        onClick={() => action.onClick(record)}
                    />
                ))}

                {Boolean(onRefetch && resource) && (
                    <CustomPopconfirm
                        okType="danger"
                        okText="Xóa"
                        cancelText="Hủy"
                        title="Xóa dữ liệu"
                        description="Bạn có chắc chắn muốn xóa dữ liệu này không?"
                        onConfirm={() => handleDelete?.(record)}
                    >
                        <CustomButton
                            type="text"
                            size="small"
                            title={'Xóa'}
                            icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
                        />
                    </CustomPopconfirm>
                )}
            </CustomSpace>
        );
    };

    const handleTableChange = (
        pagination: TablePaginationConfig,
        _: Record<string, FilterValue | null>,
        sorterParam: SorterResult<any>,
        __: TableCurrentDataSource<any>,
    ) => {
        if (pagination.current && pagination.pageSize) {
            setPageSize(pagination.pageSize);
            setCurrentPage(pagination.current);
        }

        if (sorterParam) {
            const currentSorter = Array.isArray(sorterParam) ? sorterParam[0] : sorterParam;
            if (currentSorter && currentSorter.field && currentSorter.order) {
                setSorters([
                    {
                        field: String(currentSorter.field),
                        order: currentSorter.order === SortOrder.NEWEST ? 'asc' : 'desc',
                    },
                ]);
            } else {
                setSorters([]);
            }
        } else {
            setSorters([]);
        }
    };

    return (
        <Table<any>
            {...tableProps}
            className="hub-data-table w-full"
            rowKey="id"
            loading={loading}
            pagination={false}
            columns={normalizedColumns}
            dataSource={normalizedDataSource}
            rowSelection={onRowSelectionChange ? rowSelection : undefined}
            onChange={(pagination, filters, sorter, extra) =>
                handleTableChange(pagination, filters, sorter as SorterResult<any>, extra)
            }
        />
    );
};
