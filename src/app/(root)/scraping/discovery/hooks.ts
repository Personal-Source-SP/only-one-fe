'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomMutationData, useSelectDataProvider } from '@/hooks';
import type { CrudFilter } from '@refinedev/core';
import { useMemo, useState } from 'react';
import type { CreateSessionFormValues, IDiscoverySession } from './types';

export const useDiscoveryPage = () => {
    const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { options: dataProviderOptions } = useSelectDataProvider();
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const filters: CrudFilter[] = useMemo(() => {
        const list: CrudFilter[] = [];
        if (selectedProviderId) {
            list.push({
                field: 'dataProviderId',
                operator: 'eq',
                value: selectedProviderId,
            });
        }
        if (searchTerm) {
            list.push({
                field: 'search',
                operator: 'contains',
                value: searchTerm,
            });
        }
        return list;
    }, [selectedProviderId, searchTerm]);

    const {
        data: sessions = [],
        query: { isLoading, refetch },
    } = useCustomList<IDiscoverySession>({
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        filters,
    });

    const handleCreateSession = async (values: CreateSessionFormValues) => {
        await handleCustomMutationData({
            url: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
            values: {
                dataProviderId: values.dataProviderId,
                targetUrl: values.targetUrl,
                depth: values.depth || 1,
                maxUrls: values.maxUrls || 100,
                notes: values.notes,
                targetKeyword: values.targetKeyword,
            },
            method: 'post',
            successMessage: 'Tạo phiên khám phá thành công',
            onSuccess: () => {
                setIsCreateModalOpen(false);
                refetch();
            },
        });
    };

    return {
        sessions,
        isLoading,
        dataProviderOptions,
        selectedProviderId,
        setSelectedProviderId,
        searchTerm,
        setSearchTerm,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCreating: mutation.mutation.isPending,
        handleCreateSession,
    };
};
