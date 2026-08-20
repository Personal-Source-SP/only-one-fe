'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { DataProviderFeatureStatus, DataProviderFeatureType, MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import type {
    CreateFeatureModalState,
    FeatureModalState,
    FeatureModalTab,
    IDataProviderFeature,
} from './types';

export const useDataProviderFeaturesPage = () => {
    const params = useParams();
    const router = useRouter();
    const dataProviderId = (params?.dataProviderId as string) || '';

    const [modalState, setModalState] = useState<FeatureModalState>({
        open: false,
        feature: null,
        activeTab: 'config',
    });

    const [createModalState, setCreateModalState] = useState<CreateFeatureModalState>({
        open: false,
        availableTypes: [],
    });

    const { handleCustomMutationData } = useCustomMutationData();

    // 1. Query Data Provider details
    const { result: providerResult, query: providerQuery } = useCustomData({
        url: `data-providers/${dataProviderId}`,
        enabled: Boolean(dataProviderId),
    });

    // 2. Query Scraping Feature
    const { result: scrapingResult, query: scrapingQuery } = useCustomData({
        url: `data-provider-features/data-providers/${dataProviderId}/${DataProviderFeatureType.SCRAPING}`,
        enabled: Boolean(dataProviderId),
    });

    // 3. Query Search Feature
    const { result: searchResult, query: searchQuery } = useCustomData({
        url: `data-provider-features/data-providers/${dataProviderId}/${DataProviderFeatureType.SEARCH}`,
        enabled: Boolean(dataProviderId),
    });

    const provider = providerResult?.data?.data as IDataProvider | undefined;
    const scrapingFeature = scrapingResult?.data?.data as IDataProviderFeature | undefined;
    const searchFeature = searchResult?.data?.data as IDataProviderFeature | undefined;

    const features: IDataProviderFeature[] = [scrapingFeature, searchFeature].filter(
        Boolean,
    ) as IDataProviderFeature[];

    const refetchAll = useCallback(async (): Promise<void> => {
        await Promise.all([
            providerQuery.refetch(),
            scrapingQuery.refetch(),
            searchQuery.refetch(),
        ]);
    }, [providerQuery, scrapingQuery, searchQuery]);

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

    const closeFeatureModal = (): void => {
        setModalState((prev) => ({ ...prev, open: false }));
    };

    return {
        dataProviderId,
        provider,
        features,
        isLoading: providerQuery.isLoading || scrapingQuery.isLoading || searchQuery.isLoading,
        modalState,
        createModalState,
        openFeatureModal,
        closeFeatureModal,
        setModalState,
        setCreateModalState,
        handleSwitchStatus,
        refetchAll,
        router,
    };
};
