import type { CrudSort } from '@refinedev/core';
import type { SorterResult, TablePaginationConfig } from '@/components/custom';
import { useCallback } from 'react';

type UseTableChangeProps<TData> = {
    setSorters: (sorters: CrudSort[]) => void;
    setPageSize: (size: number) => void;
    setCurrentPage: (page: number) => void;
};

export const useTableChange = <TData>({
    setSorters,
    setPageSize,
    setCurrentPage,
}: UseTableChangeProps<TData>) => {
    const handleTableChange = useCallback(
        (
            pagination: TablePaginationConfig,
            _filters: Record<string, unknown>,
            sorter: SorterResult<TData> | SorterResult<TData>[],
        ) => {
            if (pagination.current) {
                setCurrentPage(pagination.current);
            }

            if (pagination.pageSize) {
                setPageSize(pagination.pageSize);
            }

            const sorterList = Array.isArray(sorter) ? sorter : [sorter];
            const validSorters = sorterList.filter((s) => s.field && s.order);

            if (validSorters.length) {
                setSorters(
                    validSorters.map((s) => ({
                        field: String(s.field),
                        order: s.order === 'ascend' ? 'asc' : 'desc',
                    })),
                );
            } else {
                setSorters([]);
            }
        },
        [setCurrentPage, setPageSize, setSorters],
    );

    return { handleTableChange };
};
