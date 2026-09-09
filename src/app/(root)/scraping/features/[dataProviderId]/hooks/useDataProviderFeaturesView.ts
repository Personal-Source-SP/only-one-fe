'use client';

import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import { useCustomList, useCustomOne } from '@/hooks';
import type { HistoryModalState, IDataProviderFeature } from '../types';

export const useDataProviderFeaturesView = () => {
    const params = useParams();
    const dataProviderId = (params?.dataProviderId as string) || '';

    // 1. Query Data Provider details
    const { query: providerQuery, data: provider } = useCustomOne<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        id: dataProviderId,
        enabled: Boolean(dataProviderId),
    });

    // 2. Query all Features for this provider
    const { query: featuresQuery, data: features = [] } = useCustomList<IDataProviderFeature>({
        resource: API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(dataProviderId),
        queryOptions: {
            enabled: Boolean(dataProviderId),
        },
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
        dataProviderId,
        provider,
        features,
        isLoading: providerQuery.isLoading || featuresQuery.isLoading,
        historyModalState,
        openHistoryModal,
        closeHistoryModal,
        refetchAll,
    };
};
