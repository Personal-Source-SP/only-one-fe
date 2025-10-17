'use client';

import { SortOrder } from '@/enums';
import { ActionTableItem } from '@/interfaces';
import { DeleteOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { CrudSort } from '@refinedev/core';
import { Button, Dropdown, Table } from 'antd';
import { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
import { FC, memo } from 'react';

type CustomTableProps = {
    loading: boolean;
    columns: ColumnsType<any>;
    tableProps: TableProps<any>;
    actionItems?: ActionTableItem[];
    setCurrentPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setSorters: (sorter: CrudSort[]) => void;
    handleDelete?: (record: any) => void;
};

const CustomTable: FC<CustomTableProps> = ({
    columns,
    loading,
    tableProps,
    actionItems,
    setCurrentPage,
    setPageSize,
    setSorters,
    handleDelete,
}) => {
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

                {Boolean(handleDelete) && (
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
