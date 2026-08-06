'use client';

import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';
import type { DataProviderFormValues, DataProviderRecord } from './types';

export const useDataProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<DataProviderRecord>({
            resource: 'data-providers',
        });

    const { options: dataProviders } = useSelectDataProvider();

    const createModalForm = useCustomModalForm<
        DataProviderRecord,
        DataProviderFormValues,
        DataProviderRecord
    >({
        action: 'create',
        resource: 'data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        DataProviderRecord,
        DataProviderFormValues,
        DataProviderRecord
    >({
        action: 'edit',
        resource: 'data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            identifier: record.identifier,
            baseUrl: record.baseUrl,
            parentId: record.parentId,
        }),
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        dataProviders,
    };
};
