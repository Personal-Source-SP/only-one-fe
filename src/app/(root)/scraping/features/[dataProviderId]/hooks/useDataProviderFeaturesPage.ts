'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
    MessageType,
    ScraperServiceEnum,
} from '@/enums';
import { useCustomList, useCustomMutationData, useCustomOne } from '@/hooks';
import type {
    FeatureModalState,
    FeatureModalTab,
    HistoryModalState,
    IDataProviderFeature,
} from '../types';

export const useDataProviderFeaturesPage = () => {
    const params = useParams();
    const router = useRouter();
    const dataProviderId = (params?.dataProviderId as string) || '';

    const [modalState, setModalState] = useState<FeatureModalState>({
        open: false,
        feature: null,
        activeTab: 'config',
    });

    const [historyModalState, setHistoryModalState] = useState<HistoryModalState>({
        open: false,
        feature: null,
    });

    const { handleCustomMutationData } = useCustomMutationData();

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

    const refetchAll = useCallback(async (): Promise<void> => {
        await Promise.all([providerQuery.refetch(), featuresQuery.refetch()]);
    }, [providerQuery, featuresQuery]);

    const handleSwitchStatus = (
        featureId: string,
        currentStatus: DataProviderFeatureStatus,
    ): void => {
        const nextStatus =
            currentStatus === DataProviderFeatureStatus.READY
                ? DataProviderFeatureStatus.DISABLED
                : DataProviderFeatureStatus.READY;

        handleCustomMutationData({
            method: 'put',
            url: `data-provider-features/${featureId}/switch-status/${nextStatus}`,
            successNotification: () => {
                refetchAll();
                return {
                    type: MessageType.SUCCESS,
                    message: 'Cập nhật trạng thái thành công',
                };
            },
            errorNotification: (error) => ({
                type: MessageType.ERROR,
                message: 'Cập nhật trạng thái thất bại',
                description: error?.message,
            }),
        });
    };

    const openFeatureModal = (
        feature: IDataProviderFeature,
        tab: FeatureModalTab = 'config',
    ): void => {
        setModalState({ open: true, feature, activeTab: tab });
    };

    const openConfigByType = (type: DataProviderFeatureType): void => {
        const existing = features.find((f) => f.type === type);
        if (existing) {
            setModalState({ open: true, feature: existing, activeTab: 'config' });
            return;
        }

        const draftFeature: IDataProviderFeature = {
            id: '',
            dataProviderId,
            type,
            service: ScraperServiceEnum.GENERIC,
            status: DataProviderFeatureStatus.UNCONFIGURED,
            consecutiveFailures: 0,
            config: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            dataProvider: provider,
        };
        setModalState({ open: true, feature: draftFeature, activeTab: 'config' });
    };

    const closeFeatureModal = (): void => {
        setModalState((prev) => ({ ...prev, open: false }));
    };

    const openHistoryModal = useCallback((feature: IDataProviderFeature): void => {
        setHistoryModalState({ open: true, feature });
    }, []);

    const closeHistoryModal = useCallback((): void => {
        setHistoryModalState((prev) => ({ ...prev, open: false }));
    }, []);

    return {
        router,
        provider,
        features,
        modalState,
        historyModalState,
        dataProviderId,
        isLoading: providerQuery.isLoading || featuresQuery.isLoading,
        refetchAll,
        setModalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        openHistoryModal,
        closeHistoryModal,
        handleSwitchStatus,
    };
};
