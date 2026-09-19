'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IDataProvider, IDataProviderFormValues } from '../types';

export const useDataProviderPage = () => {
    const table = useCustomTable<IDataProvider>({
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
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IDataProvider, IDataProviderFormValues, IDataProvider>(
        {
            action: 'edit',
            resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
            onMutationSuccess: async () => {
                await table.tableQuery.refetch();
            },
            initialValuesMapper: (record) => ({
                name: record.name,
                baseUrl: record.baseUrl,
                identifier: record.identifier,
            }),
        },
    );

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
