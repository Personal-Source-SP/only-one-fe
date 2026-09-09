'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { DataProviderFormValues, IDataProvider } from './types';

export const useDataProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<IDataProvider>({
            resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        });

    const createModalForm = useCustomModalForm<
        IDataProvider,
        DataProviderFormValues,
        IDataProvider
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, DataProviderFormValues, IDataProvider>({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            baseUrl: record.baseUrl,
            identifier: record.identifier,
        }),
    });

    return {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        setFilters,
        setCurrentPage,
        debouncedSearch,
    };
};
