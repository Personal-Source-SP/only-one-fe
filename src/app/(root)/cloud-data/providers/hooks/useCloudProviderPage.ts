'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';

import type { CloudProviderFormValues, CloudProviderRecord } from '../types';

export const useCloudProviderPage = () => {
    const table = useCustomTable<CloudProviderRecord>({
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
    });

    const createModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.CLOUD_DATA_PROVIDERS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            type: record.type,
            config: record.config ? JSON.stringify(record.config, null, 2) : undefined,
            isActive: record.isActive,
        }),
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
