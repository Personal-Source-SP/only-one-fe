'use client';

import { useState } from 'react';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { ItemFormValues, ItemRecord } from './types';

export const useItemPage = () => {
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<ItemRecord>({
            resource: 'items',
        });

    const createModalForm = useCustomModalForm<ItemRecord, ItemFormValues, ItemRecord>({
        action: 'create',
        resource: 'items',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<ItemRecord, ItemFormValues, ItemRecord>({
        action: 'edit',
        resource: 'items',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            code: record.code,
            tags: Array.isArray(record.tags) ? record.tags.join(', ') : record.tags,
        }),
    });

    return {
        tableProps,
        tableQuery,
        debouncedSearch,
        setFilters,
        setCurrentPage,
        createModalForm,
        editModalForm,
        openImportItemModal,
        setOpenImportItemModal,
        selectedItemIds,
        setSelectedItemIds,
        openProcessScrapeDataModal,
        setOpenProcessScrapeDataModal,
    };
};
