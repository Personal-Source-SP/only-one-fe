'use client';

import { DataNotFound, FilterPanel, PaginationControls } from '@/components/common';
import { CustomCard, CustomTable } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType } from '@/enums';
import { useDebounceSearch, useTableContainer } from '@/hooks';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { CrudFilter, LogicalFilter } from '@refinedev/core';
import { Flex, Grid, Space, Spin } from 'antd';
import { ColumnsType, TableProps } from 'antd/es/table';
import { ReactNode, useMemo, useState } from 'react';
import { ListItem } from './ListItem';

type DataTableContainerProps = {
    tableContainerData: ReturnType<typeof useTableContainer>;

    title?: string | ReactNode;
    loading?: boolean;
    description?: string;
    actionButtons?: ReactNode[];
    columns?: ColumnsType<any>;
    resource?: string;
    actionItems?: ActionTableItem[];
    childrenTop?: ReactNode;
    filterSearch?: SearchFilterItem;
    childrenBottom?: ReactNode;
    customFilterItems?: FilterItem[];
    onDisableRowSelection?: (record: any) => boolean;
    onRowSelectionChange?: (selectedRows: any[]) => void;
};

export const DataTableContainer = ({
    tableContainerData,
    title,
    loading = false,
    description,
    actionButtons,
    columns,
    resource,
    actionItems,
    childrenTop,
    filterSearch,
    childrenBottom,
    customFilterItems,
    onRowSelectionChange,
    onDisableRowSelection,
}: DataTableContainerProps) => {
    const { scrollToTop } = useMainContext();

    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        filters,
        setFilters,
        setSorters,
        tableQuery,
        tableProps,
    } = tableContainerData;

    const filterItems = useMemo(() => {
        const filterItems = [];

        if (filterSearch) {
            filterItems.push({
                type: CustomFilterType.SEARCH,
                span: filterSearch?.span ?? 24,
                placeholder: filterSearch?.placeholder ?? 'Tìm kiếm',
                onChange: (value: string) => debouncedSearch(value),
            });
        }

        if (customFilterItems) {
            const customFilterItemsWithOperation = customFilterItems.map((item) => ({
                ...item,
                onChange: (value: any) => {
                    if (item.onChange) {
                        item.onChange(value);
                        return;
                    }

                    setFilters((prevFilters) => {
                        const otherFilters = prevFilters.filter(
                            (filter) => (filter as LogicalFilter)?.field !== item.field,
                        ) as CrudFilter[];

                        return [
                            ...otherFilters,
                            {
                                value,
                                field: item.field ?? '',
                                operator: item.operation ?? 'eq',
                            },
                        ];
                    });
                    setCurrentPage(1);
                },
            }));

            filterItems.push(...customFilterItemsWithOperation);
        }

        return filterItems;
    }, [customFilterItems, filterSearch, setCurrentPage, setFilters]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: filterSearch?.name ?? 'name',
    });

    const responsiveTableProps = useMemo(
        () =>
            ({
                ...tableProps,
                style: {
                    ...(tableProps as TableProps<any>).style,
                    width: '100%',
                    maxWidth: '100%',
                },
                ...(isMobile
                    ? {
                          size: 'small',
                          scroll: { x: 'max-content', ...(tableProps as TableProps<any>).scroll },
                      }
                    : {}),
            }) as TableProps<any>,
        [isMobile, tableProps],
    );

    const normalizedDataSource = useMemo(() => {
        if (Array.isArray(tableProps?.dataSource)) return tableProps.dataSource;

        if (Array.isArray((tableProps as any)?.dataSource?.data)) {
            return (tableProps as any).dataSource.data;
        }

        return [];
    }, [tableProps?.dataSource]);

    const handleListItemSelect = (record: any, selected: boolean) => {
        let newSelectedKeys: string[];
        let newSelectedRows: any[];

        if (selected) {
            newSelectedKeys = [...selectedRowKeys, record.id];
            newSelectedRows = normalizedDataSource.filter((item: any) =>
                newSelectedKeys.includes(item.id),
            );
        } else {
            newSelectedKeys = selectedRowKeys.filter((key) => key !== record.id);
            newSelectedRows = normalizedDataSource.filter((item: any) =>
                newSelectedKeys.includes(item.id),
            );
        }

        setSelectedRowKeys(newSelectedKeys);
        onRowSelectionChange?.(newSelectedRows);
    };

    const renderTitleAndActions = (
        <header className="flex w-full flex-col gap-3 md:flex-row md:items-start md:justify-between">
            {typeof title === 'string' ? (
                <div className="min-w-0 md:max-w-[65%]">
                    <h2 className="!m-0 whitespace-pre-line break-words text-base font-bold">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 !mb-0 whitespace-pre-line break-words text-sm font-normal text-hub-muted">
                            {description}
                        </p>
                    )}
                </div>
            ) : (
                <div className="w-full">{title}</div>
            )}

            {Boolean(actionButtons?.length) && (
                <Space
                    size={8}
                    wrap
                    direction="horizontal"
                    className="w-full md:w-auto md:justify-end"
                >
                    {actionButtons}
                </Space>
            )}
        </header>
    );

    const renderFilterPanel = (
        <FilterPanel
            borderless
            filterValues={filters}
            filterActions={filterItems}
            onClearFilters={() => {
                setFilters([]);
                setCurrentPage(1);
            }}
        />
    );

    const pagination = (
        <PaginationControls
            itemsPerPage={pageSize}
            currentPage={currentPage}
            totalItems={tableQuery?.data?.meta?.totalItems ?? 0}
            onPageChange={(page) => {
                setCurrentPage(page);
                scrollToTop();
            }}
            onItemsPerPageChange={(currentPageSize) => {
                setCurrentPage(1);
                setPageSize(currentPageSize);
            }}
        />
    );

    return (
        <Spin spinning={loading}>
            <Space size={12} direction="vertical" className="w-full">
                <section className="w-full">
                    <CustomCard paddingSize="default">{renderTitleAndActions}</CustomCard>
                </section>
                <section className="w-full">
                    <CustomCard paddingSize="default">{renderFilterPanel}</CustomCard>
                </section>
                <section className="w-full">
                    <CustomCard
                        paddingSize="none"
                        footer={pagination}
                        footerClassName="px-4 py-3 md:px-6"
                    >
                        <div className="p-4 md:p-6">
                            {childrenTop && <>{childrenTop}</>}

                            {!!columns?.length && (
                                <>
                                    {isMobile ? (
                                        <div className="min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto custom-scroll">
                                            {tableQuery?.isLoading ? (
                                                <Flex
                                                    justify="center"
                                                    align="center"
                                                    className="py-12"
                                                >
                                                    <Spin size="large" />
                                                </Flex>
                                            ) : normalizedDataSource.length > 0 ? (
                                                <div className="space-y-0 pb-2 pr-1">
                                                    {normalizedDataSource.map((record: any) => (
                                                        <ListItem
                                                            key={record.id}
                                                            record={record}
                                                            columns={columns}
                                                            resource={resource}
                                                            actionItems={actionItems}
                                                            currentPage={currentPage}
                                                            onRefetch={tableQuery?.refetch}
                                                            setCurrentPage={setCurrentPage}
                                                            selected={selectedRowKeys.includes(
                                                                record.id,
                                                            )}
                                                            disabled={onDisableRowSelection?.(
                                                                record,
                                                            )}
                                                            onSelectChange={
                                                                onRowSelectionChange
                                                                    ? handleListItemSelect
                                                                    : undefined
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12">
                                                    <DataNotFound />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <CustomTable
                                            columns={columns}
                                            resource={resource}
                                            setSorters={setSorters}
                                            setPageSize={setPageSize}
                                            actionItems={actionItems}
                                            setCurrentPage={setCurrentPage}
                                            loading={tableQuery?.isLoading}
                                            onRefetch={tableQuery?.refetch}
                                            tableProps={responsiveTableProps}
                                            onRowSelectionChange={onRowSelectionChange}
                                            onDisableRowSelection={onDisableRowSelection}
                                        />
                                    )}
                                </>
                            )}

                            {childrenBottom && <>{childrenBottom}</>}
                        </div>
                    </CustomCard>
                </section>
            </Space>
        </Spin>
    );
};
