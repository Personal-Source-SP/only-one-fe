'use client';

import {
    DataNotFound,
    FilterPanel,
    PaginationControls,
    TableSectionToolbar,
} from '@/components/common';
import { CustomCard, CustomTable } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType } from '@/enums';
import { useDebounceSearch, useTableContainer } from '@/hooks';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { CrudFilter, LogicalFilter } from '@refinedev/core';
import { Flex, Grid, Space, Spin } from 'antd';
import { ColumnsType, TableProps } from 'antd/es/table';
import { ReactNode, useId, useMemo, useState } from 'react';
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

    const filterPanelId = useId();
    const [filterOpen, setFilterOpen] = useState(false);
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

    const hasPageHeadingText =
        Boolean(description) || (typeof title === 'string' ? Boolean(title) : Boolean(title));
    const hasHeaderSection = hasPageHeadingText || Boolean(actionButtons?.length);

    const renderTitleAndActions = (
        <header className="flex w-full flex-col gap-3 md:flex-row md:items-start md:justify-between">
            {hasPageHeadingText &&
                (typeof title === 'string' ? (
                    <div className="min-w-0 md:max-w-[65%]">
                        {title && (
                            <h2 className="!m-0 whitespace-pre-line break-words text-base font-bold">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="mt-1 !mb-0 whitespace-pre-line break-words text-sm font-normal text-hub-muted">
                                {description}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="w-full">{title}</div>
                ))}

            {Boolean(actionButtons?.length) && (
                <Space
                    className="w-full md:w-auto md:justify-end"
                    direction="horizontal"
                    size={8}
                    wrap
                >
                    {actionButtons}
                </Space>
            )}
        </header>
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

    const renderHeaderSection = () => {
        if (!hasHeaderSection) {
            return null;
        }

        return (
            <section className="w-full">
                <CustomCard paddingSize="sm">{renderTitleAndActions}</CustomCard>
            </section>
        );
    };

    const renderTableFilterSection = !!filterItems.length && (
        <>
            <div className="flex justify-end px-3 pt-3 md:px-4 md:pt-3">
                <TableSectionToolbar
                    filterValues={filters}
                    hasFilters
                    isOpen={filterOpen}
                    isRefreshing={tableQuery?.isFetching}
                    panelId={filterPanelId}
                    onRefresh={() => tableQuery?.refetch()}
                    onToggle={() => setFilterOpen((open) => !open)}
                />
            </div>
            {filterOpen && (
                <div className="px-3 pb-2 md:px-4 md:pb-3">
                    <FilterPanel
                        borderless
                        filterActions={filterItems}
                        hideToolbar
                        isOpen={filterOpen}
                        panelId={filterPanelId}
                        onToggle={() => setFilterOpen((open) => !open)}
                    />
                </div>
            )}
        </>
    );

    return (
        <Spin spinning={loading}>
            <Space size={8} direction="vertical" className="w-full">
                {renderHeaderSection()}
                <section className="w-full overflow-hidden rounded-hub-card border border-hub-border-card bg-hub-surface">
                    {renderTableFilterSection}
                    {childrenTop && <div className="px-3 py-2 md:px-4 md:py-3">{childrenTop}</div>}

                    {!!columns?.length && (
                        <>
                            {isMobile ? (
                                <div className="custom-scroll min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-2 md:px-4 md:py-3">
                                    {tableQuery?.isLoading ? (
                                        <Flex align="center" className="py-12" justify="center">
                                            <Spin size="large" />
                                        </Flex>
                                    ) : normalizedDataSource.length > 0 ? (
                                        <div className="space-y-0 pb-2 pr-1">
                                            {normalizedDataSource.map((record: any) => (
                                                <ListItem
                                                    key={record.id}
                                                    actionItems={actionItems}
                                                    columns={columns}
                                                    currentPage={currentPage}
                                                    disabled={onDisableRowSelection?.(record)}
                                                    record={record}
                                                    resource={resource}
                                                    selected={selectedRowKeys.includes(record.id)}
                                                    setCurrentPage={setCurrentPage}
                                                    onRefetch={tableQuery?.refetch}
                                                    onSelectChange={
                                                        onRowSelectionChange
                                                            ? handleListItemSelect
                                                            : undefined
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <DataNotFound />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-3 py-2 md:px-4 md:py-3">
                                    <div className="w-full overflow-hidden rounded-lg">
                                        <CustomTable
                                            actionItems={actionItems}
                                            columns={columns}
                                            loading={tableQuery?.isLoading}
                                            resource={resource}
                                            setCurrentPage={setCurrentPage}
                                            setPageSize={setPageSize}
                                            setSorters={setSorters}
                                            tableProps={responsiveTableProps}
                                            onDisableRowSelection={onDisableRowSelection}
                                            onRefetch={tableQuery?.refetch}
                                            onRowSelectionChange={onRowSelectionChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {childrenBottom && (
                        <div className="px-3 py-2 md:px-4 md:py-3">{childrenBottom}</div>
                    )}
                    <footer className="border-t border-hub-border-card px-3 py-2 md:px-4 md:py-2.5">
                        {pagination}
                    </footer>
                </section>
            </Space>
        </Spin>
    );
};
