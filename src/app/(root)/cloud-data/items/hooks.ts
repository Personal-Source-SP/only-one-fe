'use client';

import { useState } from 'react';
import { useSelectCloudDataProvider, useTableContainer } from '@/hooks';

export const useCloudDataItemPage = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);

    const tableContainerData = useTableContainer({ resource: 'cloud-data-items' });
    const { options: cloudDataProviderOptions } = useSelectCloudDataProvider();

    return {
        openCreateItemModal,
        setOpenCreateItemModal,
        tableContainerData,
        cloudDataProviderOptions,
    };
};
