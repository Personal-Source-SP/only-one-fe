import { CrudFilters } from '@refinedev/core';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

interface UseDebounceSearchProps {
    setFilters: (filters: CrudFilters) => void;
    setCurrent: (page: number) => void;
    debounceTime?: number;
    fieldName?: string;
}

export const useDebounceSearch = ({
    setFilters,
    setCurrent,
    debounceTime = 500,
    fieldName = 'search',
}: UseDebounceSearchProps) => {
    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setFilters([{ field: fieldName, operator: 'contains', value: value.trim() }]);
                setCurrent(1);
            }, debounceTime),
        [setCurrent, setFilters, fieldName, debounceTime],
    );

    return debouncedSearch;
};
