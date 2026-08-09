'use client';

import { useState } from 'react';
import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';
import type { DataProviderFormValues, DataProviderRecord } from './types';

export const useDataProviderPage = () => {
    const [settingRecord, setSettingRecord] = useState<DataProviderRecord | null>(null);

    const openSettingModal = (record: DataProviderRecord) => {
        setSettingRecord(record);
    };

    const closeSettingModal = () => {
        setSettingRecord(null);
    };

    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<DataProviderRecord>({
            resource: 'data-providers',
        });

    const { options: dataProviders } = useSelectDataProvider();

    const createModalForm = useCustomModalForm<
        DataProviderRecord,
        DataProviderFormValues,
        DataProviderRecord
    >({
        action: 'create',
        resource: 'data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        DataProviderRecord,
        DataProviderFormValues,
        DataProviderRecord
    >({
        action: 'edit',
        resource: 'data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            identifier: record.identifier,
            baseUrl: record.baseUrl,
            parentId: record.parentId,
        }),
    });

    return {
        tableProps,
        tableQuery,
        createModalForm,
        editModalForm,
        dataProviders,
        settingRecord,
        setFilters,
        setCurrentPage,
        debouncedSearch,
        openSettingModal,
        closeSettingModal,
    };
};
