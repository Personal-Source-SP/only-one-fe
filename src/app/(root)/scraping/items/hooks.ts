'use client';

import { useState } from 'react';
import { useTableContainer } from '@/hooks';

export const useItemPage = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string | undefined>(undefined);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const tableContainerData = useTableContainer({
        resource: 'items',
    });

    return {
        openCreateItemModal,
        setOpenCreateItemModal,
        openImportItemModal,
        setOpenImportItemModal,
        editItemId,
        setEditItemId,
        selectedItemIds,
        setSelectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        tableContainerData,
    };
};
