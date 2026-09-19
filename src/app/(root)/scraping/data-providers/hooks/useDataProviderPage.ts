'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IDataProvider, IDataProviderFormValues } from '../types';

export const useDataProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        IDataProvider,
        IDataProviderFormValues,
        IDataProvider
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>(
        {
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
        },
    );

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
