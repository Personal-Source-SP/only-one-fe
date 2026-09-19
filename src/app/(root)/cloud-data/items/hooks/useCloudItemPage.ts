'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectCloudDataProvider } from '@/hooks';
import type { CloudItemFormValues, CloudItemRecord } from '../types';

export const useCloudItemPage = () => {
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();

    const table = useCustomTable<CloudItemRecord>({
        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
    });

    const createModalForm = useCustomModalForm<
        CloudItemRecord,
        CloudItemFormValues,
        CloudItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        cloudDataProviderOptions,
    };
};
