'use client';

import { PaginationControls } from '@/components/common';
import { CustomElement, CustomFilter, CustomTable } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, ElementType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { CrudFilter, LogicalFilter } from '@refinedev/core';
import { Flex, Space } from 'antd';
import { ColumnsType, TableProps } from 'antd/es/table';
import { ReactNode, useMemo } from 'react';

type TableContainerProps = {
    tableContainerData: ReturnType<typeof useTableContainer>;
    title?: string | ReactNode;
    loading?: boolean;
    actionButtons?: ReactNode[];
    columns?: ColumnsType<any>;
    resource?: string;
    actionItems?: ActionTableItem[];
    childrenTop?: ReactNode;
    filterSearch?: SearchFilterItem;
    childrenBottom?: ReactNode;
    customFilterItems?: FilterItem[];
    onRowSelectionChange?: (selectedRows: any[]) => void;
    onDisableRowSelection?: (record: any) => boolean;
};

const TableContainer = ({
    tableContainerData,
    title,
    loading,
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
}: TableContainerProps) => {
    const { scrollToTop } = useMainContext();

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
    }, [customFilterItems, filterSearch]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: filterSearch?.name ?? 'name',
    });

    return (
        <CustomElement elementType={ElementType.CONTAINER} loading={loading}>
            <CustomElement
                elementType={ElementType.CARD}
                header={
                    <Flex
                        gap={8}
                        align="center"
                        className="w-full"
                        justify={title ? 'space-between' : 'end'}
                    >
                        {typeof title === 'string' ? (
                            <h2 className="text-bases font-bold !m-0">{title}</h2>
                        ) : (
                            <div className="w-full sm:w-auto">{title}</div>
                        )}

                        {Boolean(actionButtons?.length) && (
                            <Space size="middle">{actionButtons}</Space>
                        )}
                    </Flex>
                }
                actions={[
                    <PaginationControls
                        itemsPerPage={pageSize}
                        currentPage={currentPage}
                        totalItems={tableQuery?.data?.meta?.totalItems ?? 0}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                            scrollToTop();
                        }}
                        onItemsPerPageChange={(pageSize) => {
                            setCurrentPage(1);
                            setPageSize(pageSize);
                        }}
                    />,
                ]}
            >
                <CustomFilter
                    filterValues={filters}
                    filterActions={filterItems}
                    onClearFilters={() => {
                        setFilters([]);
                        setCurrentPage(1);
                    }}
                />

                {childrenTop && childrenTop}

                {!!columns?.length && (
                    <CustomTable
                        columns={columns}
                        resource={resource}
                        setSorters={setSorters}
                        setPageSize={setPageSize}
                        actionItems={actionItems}
                        setCurrentPage={setCurrentPage}
                        loading={tableQuery?.isLoading}
                        onRefetch={tableQuery?.refetch}
                        tableProps={tableProps as TableProps<any>}
                        onRowSelectionChange={onRowSelectionChange}
                        onDisableRowSelection={onDisableRowSelection}
                    />
                )}

                {childrenBottom && childrenBottom}
            </CustomElement>
        </CustomElement>
    );
};

export default TableContainer;
