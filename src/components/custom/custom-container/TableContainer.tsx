'use client';

import { PaginationControls } from '@/components/common';
import { CustomElement, CustomFilter, CustomTable } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, ElementType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { ColumnsType } from 'antd/es/table';
import { FC, memo, useMemo } from 'react';

type TableContainerProps = {
    loading?: boolean;
    resource?: string;
    columns?: ColumnsType<any>;
    filterSearch?: SearchFilterItem;
    customFilterItems?: FilterItem[];
    actionItems?: ActionTableItem[];
    childrenTop?: React.ReactNode;
    childrenBottom?: React.ReactNode;
    tableContainerData: ReturnType<typeof useTableContainer>;
    onDisableRowSelection?: (record: any) => boolean;
    onRowSelectionChange?: (selectedRows: any[]) => void;
};

const TableContainer: FC<TableContainerProps> = ({
    loading,
    resource,
    columns,
    filterSearch,
    customFilterItems,
    actionItems,
    childrenTop,
    childrenBottom,
    tableContainerData,
    onRowSelectionChange,
    onDisableRowSelection,
}) => {
    const { scrollToTop } = useMainContext();

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
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

    const debouncedSearch = useDebounceSearch({
        setFilters,
        setCurrentPage,
        fieldName: filterSearch?.name ?? 'name',
    });

    return (
        <CustomElement
            elementType={ElementType.CONTAINER}
            loading={tableQuery?.isLoading ?? loading}
        >
            <CustomElement
                elementType={ElementType.CARD}
                header={<CustomFilter filters={filterItems} />}
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
