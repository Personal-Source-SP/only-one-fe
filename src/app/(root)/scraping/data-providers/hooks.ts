'use client';

import { useState } from 'react';
import { useCustomModal, useSelectDataProvider, useTableContainer } from '@/hooks';

export const useDataProviderPage = () => {
    const [openCreateItemModal, setOpenCreateItemModal] = useState(false);
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [editItemId, setEditItemId] = useState<string>();
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);
    const [selectedDataProviderIds, setSelectedDataProviderIds] = useState<string[]>([]);

    const tableContainerData = useTableContainer({ resource: 'data-providers' });
    const modalPropsData = useCustomModal({ action: 'edit', resource: 'data-providers' });
    const { options: dataProviders, query: dataProviderQuery } = useSelectDataProvider();

    return {
        openCreateItemModal,
        setOpenCreateItemModal,
        openImportItemModal,
        setOpenImportItemModal,
        editItemId,
        setEditItemId,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
        selectedDataProviderIds,
        setSelectedDataProviderIds,
        tableContainerData,
        modalPropsData,
        dataProviders,
        dataProviderQuery,
    };
};
