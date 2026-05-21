'use client';

import {
    DataNotFound,
    FilterPanel,
    PaginationControls,
    TableSectionToolbar,
} from '@/components/common';
import {
    ColumnsType,
    CustomCard,
    CustomDivider,
    CustomGrid,
    CustomSpace,
    CustomSpin,
    CustomTable,
    TableProps,
} from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType } from '@/enums';
import { useDebounceSearch, useTableContainer } from '@/hooks';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { CrudFilter, LogicalFilter } from '@refinedev/core';
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

    const filterPanelId = useId();
    const screens = CustomGrid.useBreakpoint();
    const isMobile = !screens.md;

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

    const renderHeaderSection = () => {
        const hasPageHeadingText =
            Boolean(description) || (typeof title === 'string' ? Boolean(title) : Boolean(title));

        const hasHeaderSection = hasPageHeadingText || Boolean(actionButtons?.length);
        if (!hasHeaderSection) return null;

        return (
            <section className="w-full">
                <CustomCard paddingSize="sm">
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
                            <CustomSpace
                                wrap
                                size={8}
                                direction="horizontal"
                                className="w-full md:w-auto md:justify-end"
                            >
                                {actionButtons}
                            </CustomSpace>
                        )}
                    </header>
                </CustomCard>
            </section>
        );
    };

    const renderTableFilterSection = () => {
        if (!filterItems.length) return null;

        return (
            <CustomSpace size="middle" direction="vertical" className="w-full pt-3">
                <div className="flex w-full justify-end">
                    <TableSectionToolbar
                        hasFilters
                        isOpen={filterOpen}
                        filterValues={filters}
                        panelId={filterPanelId}
                        isRefreshing={tableQuery?.isFetching}
                        onRefresh={() => tableQuery?.refetch()}
                        onToggle={() => setFilterOpen((open) => !open)}
                    />
                </div>

                {filterOpen && (
                    <FilterPanel
                        borderless
                        hideToolbar
                        isOpen={filterOpen}
                        panelId={filterPanelId}
                        filterActions={filterItems}
                        onToggle={() => setFilterOpen((open) => !open)}
                    />
                )}

                <CustomDivider className="!border-hub-border/50" />
            </CustomSpace>
        );
    };

    return (
        <CustomSpin spinning={loading || tableQuery?.isLoading}>
            <CustomSpace size="middle" direction="vertical" className="w-full">
                {renderHeaderSection()}

                <CustomSpace
                    size="middle"
                    direction="vertical"
                    className="w-full overflow-hidden rounded-hub-card border border-hub-border-card bg-hub-surface px-3 md:px-4"
                >
                    {renderTableFilterSection()}

                    {childrenTop}

                    {!!columns?.length &&
                        (isMobile ? (
                            <div className="custom-scroll min-h-[200px] max-h-[calc(100vh-300px)] w-full overflow-y-auto">
                                {normalizedDataSource.length ? (
                                    normalizedDataSource.map((record: any) => (
                                        <ListItem
                                            key={record.id}
                                            record={record}
                                            columns={columns}
                                            resource={resource}
                                            actionItems={actionItems}
                                            currentPage={currentPage}
                                            onRefetch={tableQuery?.refetch}
                                            selected={selectedRowKeys.includes(record.id)}
                                            setCurrentPage={setCurrentPage}
                                            disabled={onDisableRowSelection?.(record)}
                                            onSelectChange={
                                                onRowSelectionChange
                                                    ? handleListItemSelect
                                                    : undefined
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="py-8">
                                        <DataNotFound />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                resource={resource}
                                actionItems={actionItems}
                                loading={tableQuery?.isLoading}
                                onRefetch={tableQuery?.refetch}
                                tableProps={responsiveTableProps}
                                setSorters={setSorters}
                                setPageSize={setPageSize}
                                setCurrentPage={setCurrentPage}
                                onDisableRowSelection={onDisableRowSelection}
                                onRowSelectionChange={onRowSelectionChange}
                            />
                        ))}

                    {childrenBottom}

                    <footer className="w-full border-t border-hub-border-card py-2 md:py-2.5">
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
                    </footer>
                </CustomSpace>
            </CustomSpace>
        </CustomSpin>
    );
};
