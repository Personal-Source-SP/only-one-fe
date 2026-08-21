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
    const [loading, setLoading] = useState(false);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderItemIds, setSelectedDataProviderItemIds] = useState<string[]>([]);

    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData();
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<ProviderItemRecord>({
            resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
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
            dataProviderId: record.dataProviderId,
            itemUrl: record.itemUrl,
            cloudDataProviderId: record.cloudDataProviderId,
            autoProcessScraping: record.autoProcessScraping,
            checkDuplicateData: record.checkDuplicateData,
            isSavedToCloudData: record.isSavedToCloudData,
        }),
    });

    const handleSwitchStatus = (id: string, active: boolean) => {
        setLoading(true);

        handleUpdate({
            values: {},
            method: 'put',
            url: `data-provider-items/${id}/switch-status/${active}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    setLoading(false);

                    return {
                        type: MessageType.ERROR,
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                tableQuery?.refetch();
                setLoading(false);

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                setLoading(false);

                return {
                    type: MessageType.ERROR,
                    message: 'Chuyển trạng thái thất bại',
                    description: error?.message ?? 'Chuyển trạng thái thất bại',
                };
            },
        });
    };

    return {
        loading,
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderItemIds,
        setSelectedDataProviderItemIds,
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        handleSwitchStatus,
    };
};
