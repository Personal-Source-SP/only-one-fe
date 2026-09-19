'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { CloudProviderFormValues, CloudProviderRecord } from '../types';

export const useCloudProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch } = useCustomTable<CloudProviderRecord>({
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
            await tableQuery.refetch();
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
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            type: record.type,
            config: record.config ? JSON.stringify(record.config, null, 2) : undefined,
            isActive: record.isActive,
        }),
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
