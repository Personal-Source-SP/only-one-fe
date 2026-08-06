'use client';

import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { UserFormValues, UserRecord } from './types';

export const useUsersPage = () => {
    const { tableProps, tableQuery, debouncedSearch, setFilters, setCurrentPage } =
        useCustomTable<UserRecord>({
            resource: 'users',
        });

    const createModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'create',
        resource: 'users',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'edit',
        resource: 'users',
        onMutationSuccess: async () => {
            await tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            userName: record.userName,
            email: record.email,
            isActive: record.isActive,
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
