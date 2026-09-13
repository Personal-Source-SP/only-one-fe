'use client';

import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from '@/app/(root)/scraping/features/enums';
import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomModalForm, useSelectDataProvider } from '@/hooks';
import type { CrudFilter } from '@refinedev/core';
import { useMemo, useState } from 'react';
import type { CreateSessionFormValues, IDiscoverySession } from './types';

export const useDiscoveryPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProviderId, setSelectedProviderId] = useState<string>();

    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        filter: (provider) =>
            provider.features?.some(
                (f) =>
                    f.type === DataProviderFeatureType.SEARCH &&
                    f.status === DataProviderFeatureStatus.READY,
            ) ?? false,
    });

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

    const createModalForm = useCustomModalForm<
        IDiscoverySession,
        CreateSessionFormValues,
        IDiscoverySession
    >({
        action: 'create',
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        successMessage: 'Tạo phiên khám phá thành công',
        onMutationSuccess: async () => {
            await refetch();
        },
        onFinish: (values) => {
            const rawKeywords = values.targetKeywords;
            const targetKeywords = Array.isArray(rawKeywords)
                ? rawKeywords.map((k) => k.trim()).filter(Boolean)
                : undefined;

            return {
                ...values,
                targetKeywords,
                depth: values.depth || 1,
            };
        },
    });

    return {
        sessions,
        isLoading,
        searchTerm,
        createModalForm,
        dataProviderQuery,
        dataProviderOptions,
        selectedProviderId,
        setSearchTerm,
        setSelectedProviderId,
    };
};
