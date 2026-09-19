'use client';

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
import type { IDataProviderItemFormValues, ProviderItemRecord } from '../types';

export const useProviderItemPage = () => {
    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const table = useCustomTable<ProviderItemRecord>({
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

            table.tableQuery?.refetch();

            return {
                type: MessageType.SUCCESS,
                message: 'Chuyển trạng thái thành công',
            };
        },
        errorNotification: (error) => ({
            type: MessageType.ERROR,
            message: 'Chuyển trạng thái thất bại',
            description: error?.message ?? 'Chuyển trạng thái thất bại',
        }),
    });

    const createModalForm = useCustomModalForm<
        ProviderItemRecord,
        IDataProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'create',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        ProviderItemRecord,
        IDataProviderItemFormValues,
        ProviderItemRecord
    >({
        action: 'edit',
        resource: API_ENDPOINT.DATA_PROVIDER_ITEMS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
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

    return {
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        handleUpdate,
        createModalForm,
        editModalForm,
    };
};
