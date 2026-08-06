'use client';

import { useState } from 'react';
import { MessageType } from '@/enums';
import {
    useCustomMutationData,
    useSelectCloudDataProvider,
    useSelectDataProvider,
    useSelectItem,
    useTableContainer,
} from '@/hooks';

export const useDataProviderItemPage = () => {
    const [loading, setLoading] = useState(false);
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderItemIds, setSelectedDataProviderItemIds] = useState<string[]>([]);

    const { options: itemOptions } = useSelectItem();
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider();

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData();
    const tableContainerData = useTableContainer({ resource: 'data-provider-items' });

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

                tableContainerData?.tableQuery?.refetch();

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
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderItemIds,
        setSelectedDataProviderItemIds,
        itemOptions,
        cloudDataProviderOptions,
        dataProviderOptions,
        dataProviderQuery,
        tableContainerData,
        handleSwitchStatus,
    };
};
