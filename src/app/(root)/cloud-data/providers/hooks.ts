'use client';

import { useState } from 'react';
import { useTableContainer } from '@/hooks';

export const useCloudDataProviderPage = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);

    const tableContainerData = useTableContainer({
        resource: 'cloud-data-providers',
    });

    return {
        openCreateItemModal,
        setOpenCreateItemModal,
        editItemId,
        setEditItemId,
        tableContainerData,
    };
};
