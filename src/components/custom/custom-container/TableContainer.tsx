'use client';

import { PaginationControls } from '@/components/common';
import { CustomElement, CustomFilter, CustomTable } from '@/components/custom';
import { CustomFilterType, ElementType } from '@/enums';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { useTable } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { ColumnsType } from 'antd/es/table';
import { FC, memo, useEffect, useMemo } from 'react';

type TableContainerProps = {
    resource?: string;
    columns?: ColumnsType<any>;
    quantityRefetch?: number;
    filterSearch?: SearchFilterItem;
    customFilterItems?: FilterItem[];
    actionItems?: ActionTableItem[];
    childrenTop?: React.ReactNode;
    childrenBottom?: React.ReactNode;
    onDisableRowSelection?: (record: any) => boolean;
    onRowSelectionChange?: (selectedRows: any[]) => void;
};

const TableContainer: FC<TableContainerProps> = ({
    resource,
    columns,
    quantityRefetch,
    filterSearch,
    customFilterItems,
    actionItems,
    childrenTop,
    childrenBottom,
    onRowSelectionChange,
    onDisableRowSelection,
}) => {
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        setFilters,
        setSorters,
        tableQuery,
        tableProps,
    } = useTable<any, HttpError, Partial<any>>({
        resource,
        syncWithLocation: false,
        pagination: {
            pageSize: 10,
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [{ field: 'createdAt', order: 'desc' }],
        },
        queryOptions: {
            enabled: !!columns?.length && !!resource,
        },
    });

    const data = useMemo(() => {
        return tableQuery?.data?.data ?? [];
    }, [tableQuery?.data?.data]);

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
                    setFilters([
                        {
                            value,
                            field: item.field ?? '',
                            operator: item.operation ?? 'eq',
                        },
                    ]);
                    setCurrentPage(1);
                },
            }));

            filterItems.push(...customFilterItemsWithOperation);
        }

        return filterItems;
    }, [customFilterItems, filterSearch]);

    useEffect(() => {
        if (quantityRefetch) {
            tableQuery?.refetch();
        }
    }, [quantityRefetch]);

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: filterSearch?.name ?? 'name',
    });

    return (
        <CustomElement elementType={ElementType.CONTAINER}>
            <CustomElement
                elementType={ElementType.CARD}
                header={<CustomFilter filters={filterItems} />}
                actions={[
                    <PaginationControls
                        itemsPerPage={pageSize}
                        currentPage={currentPage}
                        totalItems={data?.length}
                        onPageChange={(page) => setCurrentPage(page)}
                        onItemsPerPageChange={(pageSize) => {
                            setCurrentPage(1);
                            setPageSize(pageSize);
                        }}
                    />,
                ]}
            >
                {childrenTop && childrenTop}

                {!!columns?.length && (
                    <CustomTable
                        columns={columns}
                        resource={resource}
                        tableProps={tableProps}
                        setSorters={setSorters}
                        setPageSize={setPageSize}
                        actionItems={actionItems}
                        setCurrentPage={setCurrentPage}
                        loading={tableQuery?.isLoading}
                        onRefetch={tableQuery?.refetch}
                        onRowSelectionChange={onRowSelectionChange}
                        onDisableRowSelection={onDisableRowSelection}
                    />
                )}

                {childrenBottom && childrenBottom}
            </CustomElement>
        </CustomElement>
    );
};

export default memo(TableContainer);
