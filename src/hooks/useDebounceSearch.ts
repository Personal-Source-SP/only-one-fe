import { CrudFilters } from '@refinedev/core';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

interface UseDebounceSearchProps {
    setCurrentPage: (page: number) => void;
    setFilters: (filters: CrudFilters) => void;
    fieldName?: string;
    debounceTime?: number;
}

export const useDebounceSearch = ({
    setCurrentPage,
    setFilters,
    fieldName = 'search',
    debounceTime = 500,
}: UseDebounceSearchProps) => {
    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setFilters([{ field: fieldName, operator: 'contains', value: value.trim() }]);
                setCurrentPage(1);
            }, debounceTime),
        [setCurrentPage, setFilters, fieldName, debounceTime],
    );

    return debouncedSearch;
};
