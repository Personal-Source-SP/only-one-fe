'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IUserFormValues, UserFormValues, UserRecord } from '../types';

export const useUsersPage = () => {
    const table = useCustomTable<UserRecord>({
        resource: API_ENDPOINT.USERS.BASE,
    });

    const createModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'create',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<UserRecord, UserFormValues, UserRecord>({
        action: 'edit',
        resource: API_ENDPOINT.USERS.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            userName: record.userName,
            email: record.email,
            isActive: record.isActive,
        }),
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
