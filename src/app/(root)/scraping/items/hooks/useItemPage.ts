'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import { useState } from 'react';
import type { IItem, IItemFormValues } from '../types';

export const useItemPage = () => {
    const [openImportItemModal, setOpenImportItemModal] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [openProcessScrapeDataModal, setOpenProcessScrapeDataModal] = useState(false);

    const table = useCustomTable<IItem>({
        resource: API_ENDPOINT.ITEMS.BASE,
    });

    const createModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
        action: 'create',
        resource: API_ENDPOINT.ITEMS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<IItem, IItemFormValues, IItem>({
        action: 'edit',
        resource: API_ENDPOINT.ITEMS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            code: record.code ?? '',
            tags: Array.isArray(record.tags) ? record.tags.join(', ') : (record.tags ?? ''),
        }),
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
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
