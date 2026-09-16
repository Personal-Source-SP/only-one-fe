'use client';

import { useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import {
    useCustomModalForm,
    useCustomMutationData,
    useCustomTable,
    useSelectCloudDataProvider,
    useSelectDataProvider,
    useSelectItem,
} from '@/hooks';
import type { ProviderItemFormValues, ProviderItemRecord } from './types';

export const useDataProviderItemPage = () => {
    const [switchingId, setSwitchingId] = useState<string | null>(null);
    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<ProviderItemRecord>({
            resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        });

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData({
        method: 'put',
        successNotification: (data) => {
            if (!data?.data?.isSuccess) {
                return {
                    type: MessageType.ERROR,
                    message: 'Chuyển trạng thái thất bại',
                    description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                };
            }

            tableQuery?.refetch();

            return {
                type: MessageType.SUCCESS,
                message: 'Chuyển trạng thái thành công',
            };
        },
        errorNotification: (error) => {
            return {
                type: MessageType.ERROR,
                message: 'Chuyển trạng thái thất bại',
                description: error?.message ?? 'Chuyển trạng thái thất bại',
            };
        },
    });

    const createModalForm = useCustomModalForm<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        ProviderItemRecord,
        ProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            itemId: record.itemId,
            itemUrl: record.itemUrl,
            dataProviderId: record.dataProviderId,
            cloudDataProviderId: record.cloudDataProviderId,
            autoProcessScraping: record.autoProcessScraping,
            checkDuplicateData: record.checkDuplicateData,
            isSavedToCloudData: record.isSavedToCloudData,
        }),
    });

    const handleSwitchStatus = async (id: string, active: boolean) => {
        if (switchingId) return;
        setSwitchingId(id);
        try {
            await handleUpdate({
                url: API_ENDPOINT.DATA_PROVIDER_ITEMS.SWITCH_STATUS(id, active),
            });
        } finally {
            setSwitchingId(null);
        }
    };

    return {
        switchingId,
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        handleSwitchStatus,
    };
};
