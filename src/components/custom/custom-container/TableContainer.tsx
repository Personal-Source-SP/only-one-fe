'use client';

import { PaginationControls } from '@/components/common';
import { CustomElement, CustomFilter, CustomTable } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { CustomFilterType, ElementType } from '@/enums';
import { useTableContainer } from '@/hooks';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { ActionTableItem, FilterItem, SearchFilterItem } from '@/interfaces';
import { CrudFilter, LogicalFilter } from '@refinedev/core';
import { Flex, Grid, Space } from 'antd';
import { ColumnsType, TableProps } from 'antd/es/table';
import { Fragment, ReactNode, useMemo } from 'react';

type TableContainerProps = {
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

const TableContainer = ({
    tableContainerData,
    title,
    loading,
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
}: TableContainerProps) => {
    const { scrollToTop } = useMainContext();
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

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

    return (
        <CustomElement elementType={ElementType.CONTAINER} loading={loading}>
            <CustomElement
                elementType={ElementType.CARD}
                header={
                    <Space size={8} direction="vertical" className="w-full mb-4">
                        <Flex
                            gap={8}
                            vertical={isMobile}
                            className="w-full"
                            wrap={isMobile ? 'wrap' : 'nowrap'}
                            align={isMobile ? 'stretch' : 'center'}
                            justify={isMobile ? 'start' : title ? 'space-between' : 'end'}
                        >
                            {typeof title === 'string' ? (
                                <div>
                                    <h2 className="text-bases font-bold !m-0 whitespace-pre-line break-words">
                                        {title}
                                    </h2>
                                    {description && (
                                        <p className="hidden md:block text-sm font-normal mt-1 whitespace-pre-line break-words">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full sm:w-auto">{title}</div>
                            )}

                            {Boolean(actionButtons?.length) && (
                                <Space
                                    className="w-full"
                                    size={isMobile ? 8 : 16}
                                    align={isMobile ? 'center' : 'end'}
                                    direction={isMobile ? 'horizontal' : 'vertical'}
                                >
                                    {actionButtons}
                                </Space>
                            )}
                        </Flex>
                        <CustomFilter
                            filterValues={filters}
                            filterActions={filterItems}
                            onClearFilters={() => {
                                setFilters([]);
                                setCurrentPage(1);
                            }}
                        />
                    </Space>
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
                {childrenTop && <Fragment key="children-top">{childrenTop}</Fragment>}

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
                        tableProps={responsiveTableProps}
                        onRowSelectionChange={onRowSelectionChange}
                        onDisableRowSelection={onDisableRowSelection}
                    />
                )}

                {childrenBottom && <Fragment key="children-bottom">{childrenBottom}</Fragment>}
            </CustomElement>
        </CustomElement>
    );
};

export default TableContainer;
