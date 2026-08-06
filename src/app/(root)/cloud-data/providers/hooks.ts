'use client';

import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { CloudProviderFormValues, CloudProviderRecord } from './types';

export const useCloudDataProviderPage = () => {
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<CloudProviderRecord>({
            resource: 'cloud-data-providers',
        });

    const createModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'create',
        resource: 'cloud-data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        onFinish: (values) => ({
            ...values,
            config: values.config ? JSON.parse(values.config) : undefined,
        }),
    });

    const editModalForm = useCustomModalForm<
        CloudProviderRecord,
        CloudProviderFormValues,
        CloudProviderRecord
    >({
        action: 'edit',
        resource: 'cloud-data-providers',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            type: record.type,
            config:
                typeof record.config === 'object'
                    ? JSON.stringify(record.config, null, 2)
                    : record.config,
            isActive: record.isActive,
        }),
        onFinish: (values) => ({
            ...values,
            config: values.config ? JSON.parse(values.config) : undefined,
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
    };
};
