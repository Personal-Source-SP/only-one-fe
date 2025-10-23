'use client';

import { SortOrder } from '@/enums';
import { ActionTableItem, NBaseApi } from '@/interfaces';
import { DeleteOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { CrudSort, useDelete } from '@refinedev/core';
import { Button, Dropdown, message, Modal, Table } from 'antd';
import { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import { FC, memo } from 'react';

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
};

const CustomTable: FC<CustomTableProps> = ({
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
}) => {
    const { mutate: deleteRecord } = useDelete<NBaseApi.IResponse<boolean>>();

    const handleDelete = (record: any) => {
        Modal.confirm({
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            title: 'Xóa dữ liệu',
            icon: <Icon icon="lucide:trash" />,
            content: 'Bạn có chắc chắn muốn xóa dữ liệu này không?',
            onOk: () => {
                deleteRecord(
                    {
                        id: record.id,
                        resource: resource || '',
                    },
                    {
                        onSuccess: () => {
                            if (
                                currentPage &&
                                currentPage > 1 &&
                                tableProps.dataSource?.length === 1
                            ) {
                                setCurrentPage(currentPage - 1);
                            } else {
                                onRefetch?.();
                            }
                        },
                        onError: (error) => {
                            message.error(error?.message || 'Lỗi xóa dữ liệu không thành công');
                        },
                    },
                );
            },
        });
    };

    const renderAction = (record: any) => {
        return (
            <>
                {actionItems?.map((action) => (
                    <Button
                        type="text"
                        size="small"
                        icon={action.icon}
                        title={action.label}
                        onClick={() => action.onClick(record)}
                    />
                ))}

                {Boolean(onRefetch && resource) && (
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: 'delete',
                                    onClick: () => handleDelete?.(record),
                                    label: <span className="text-red-500">Delete</span>,
                                    icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                                },
                            ],
                        }}
                    >
                        <Button
                            type="text"
                            size="small"
                            title={'Actions'}
                            icon={<Icon icon="lucide:more-vertical" />}
                        />
                    </Dropdown>
                )}
            </>
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
            bordered
            rowKey="id"
            loading={loading}
            pagination={false}
            dataSource={tableProps.dataSource}
            columns={[
                ...columns,
                {
                    key: 'action',
                    fixed: 'right',
                    align: 'center',
                    title: 'Hành động',
                    dataIndex: 'action',
                    render: (_: any, record: any) => renderAction(record),
                },
            ]}
            onChange={(pagination, filters, sorter, extra) =>
                handleTableChange(pagination, filters, sorter as SorterResult<any>, extra)
            }
        />
    );
};

export default memo(CustomTable);
