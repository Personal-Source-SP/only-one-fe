'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomOne } from '@/hooks';
import type { HistoryModalState, IDataProviderFeature } from '../types';

export const useFeaturesView = () => {
    const params = useParams();
    const dataProviderId = (params?.dataProviderId as string) || '';

    // 1. Query Data Provider details
    const { query: providerQuery, data: provider } = useCustomOne<IDataProvider>({
        id: dataProviderId,
        enabled: Boolean(dataProviderId),
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
    });

    // 2. Query all Features for this provider
    const { query: featuresQuery, data: features = [] } = useCustomList<IDataProviderFeature>({
        queryOptions: { enabled: Boolean(dataProviderId) },
        resource: API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(dataProviderId),
        transform: (list) => (list && list.length > 0 ? list : provider?.features || []),
    });

    // 3. History Modal State
    const [historyModalState, setHistoryModalState] = useState<HistoryModalState>({
        open: false,
        feature: null,
    });

    const openHistoryModal = useCallback((feature: IDataProviderFeature): void => {
        setHistoryModalState({ open: true, feature });
    }, []);

    const closeHistoryModal = useCallback((): void => {
        setHistoryModalState((prev) => ({ ...prev, open: false }));
    }, []);

    const refetchAll = useCallback(async (): Promise<void> => {
        await Promise.all([providerQuery.refetch(), featuresQuery.refetch()]);
    }, [providerQuery, featuresQuery]);

    return {
        provider,
        features,
        dataProviderId,
        historyModalState,
        isLoading: providerQuery.isLoading || featuresQuery.isLoading,
        openHistoryModal,
        closeHistoryModal,
        refetchAll,
    };
};
