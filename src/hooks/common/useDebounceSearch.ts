import { CrudFilter } from '@refinedev/core';
import { useCallback, useRef } from 'react';

export const useDebounceSearch = ({
    setFilters,
    setCurrentPage,
    fieldName = 'name',
    delay = 500,
}: {
    setFilters: (filters: CrudFilter[]) => void;
    setCurrentPage?: (page: number) => void;
    fieldName?: string;
    delay?: number;
}) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedSearch = useCallback(
        (value: string) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setFilters([
                    {
                        field: fieldName,
                        operator: 'contains',
                        value: value || undefined,
                    },
                ]);
                if (setCurrentPage) {
                    setCurrentPage(1);
                }
            }, delay);
        },
        [delay, fieldName, setCurrentPage, setFilters],
    );

    return debouncedSearch;
};
