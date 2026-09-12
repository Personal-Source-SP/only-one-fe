'use client';

import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from '@/app/(root)/scraping/features/enums';
import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomMutationData, useSelectDataProvider } from '@/hooks';
import type { CrudFilter } from '@refinedev/core';
import { useMemo, useState } from 'react';
import type { CreateSessionFormValues, IDiscoverySession } from './types';

export const useDiscoveryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedProviderId, setSelectedProviderId] = useState<string>();

    const { options: dataProviderOptions } = useSelectDataProvider({
        filter: (provider) =>
            provider.features?.some(
                (f) =>
                    f.type === DataProviderFeatureType.SEARCH &&
                    f.status === DataProviderFeatureStatus.READY,
            ) ?? false,
    });
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const filters: CrudFilter[] = useMemo(() => {
        const list: CrudFilter[] = [];

        if (selectedProviderId) {
            list.push({
                operator: 'eq',
                field: 'dataProviderId',
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
        filters,
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const handleCreateSession = async (values: CreateSessionFormValues) => {
        await handleCustomMutationData({
            method: 'post',
            url: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
            values: {
                depth: values.depth || 1,
                maxUrls: values.maxUrls,
                dataProviderId: values.dataProviderId,
                targetKeywords: values.targetKeywords,
            },
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
