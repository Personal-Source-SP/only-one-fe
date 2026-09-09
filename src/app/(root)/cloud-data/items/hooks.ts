'use client';

import { API_ENDPOINT, RESOURCE } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectCloudDataProvider } from '@/hooks';
import type { CloudItemFormValues, CloudItemRecord } from './types';

export const useCloudDataItemPage = () => {
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<CloudItemRecord>({
            resource: RESOURCE.CLOUD_DATA_ITEMS,
        });

    const createModalForm = useCustomModalForm<
        CloudItemRecord,
        CloudItemFormValues,
        CloudItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.CLOUD_DATA_ITEMS.UPLOAD,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        onFinish: (values) => {
            const fileList = values.file as any[];
            if (!fileList?.length || !fileList[0]?.originFileObj) {
                return values;
            }

            const formData = new FormData();
            formData.append('file', fileList[0].originFileObj);
            formData.append('cloudDataProviderId', values.cloudDataProviderId);

            return formData;
        },
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        cloudDataProviderOptions,
    };
};
