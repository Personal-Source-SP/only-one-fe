'use client';

import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from '@/app/(root)/scraping/features/enums';
import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable, useSelectDataProvider } from '@/hooks';

import type { CreateSessionFormValues, IDiscoverySession } from '../types';

export const useDiscoveryPage = () => {
    const { options: dataProviderOptions, query: dataProviderQuery } = useSelectDataProvider({
        featureType: DataProviderFeatureType.SEARCH,
        featureStatus: DataProviderFeatureStatus.READY,
    });

    const table = useCustomTable<IDiscoverySession>({
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
    });

    const createModalForm = useCustomModalForm<
        IDiscoverySession,
        CreateSessionFormValues,
        IDiscoverySession
    >({
        action: 'create',
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        successNotification: { type: 'success', message: 'Tạo phiên khám phá thành công' },
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
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
        dataProviderOptions,
        dataProviderQuery,
        table,
        debouncedSearch: table.debouncedSearch,
        setFilters: table.setFilters,
        createModalForm,
    };
};
