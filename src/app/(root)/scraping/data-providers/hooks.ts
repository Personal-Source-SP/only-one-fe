'use client';

import { useState } from 'react';
import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';
import type { DataProviderFormValues, DataProviderRecord } from './types';
import type { SettingConfigType } from './components/DataProviderSettingModal';

export interface SettingModalState {
    record: DataProviderRecord;
    configType: SettingConfigType;
}

export const useDataProviderPage = () => {
    const [settingModalState, setSettingModalState] = useState<SettingModalState | null>(null);

    const openSettingModal = (
        record: DataProviderRecord,
        configType: SettingConfigType = 'target',
    ) => {
        setSettingModalState({ record, configType });
    };

    const closeSettingModal = () => {
        setSettingModalState(null);
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
        settingModalState,
        settingRecord: settingModalState?.record || null,
        settingConfigType: settingModalState?.configType || 'target',
        setFilters,
        setCurrentPage,
        debouncedSearch,
        openSettingModal,
        closeSettingModal,
    };
};
