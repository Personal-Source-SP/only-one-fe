'use client';

import { useCallback, useState } from 'react';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';

import { DataProviderFeatureStatus, DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FeatureModalState, FeatureModalTab, IDataProviderFeature } from '../types';

export type UseDataProviderFeatureActionsProps = {
    dataProviderId: string;
    features: IDataProviderFeature[];
    provider?: IDataProvider;
    refetchAll: () => Promise<void>;
};

export const useDataProviderFeatureActions = ({
    dataProviderId,
    features,
    provider,
    refetchAll,
}: UseDataProviderFeatureActionsProps) => {
    const [modalState, setModalState] = useState<FeatureModalState>({
        open: false,
        feature: null,
        activeTab: 'config',
    });

    const { handleCustomMutationData } = useCustomMutationData();

    const handleSwitchStatus = useCallback(
        (featureId: string, currentStatus: DataProviderFeatureStatus): void => {
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
        },
        [handleCustomMutationData, refetchAll],
    );

    const openFeatureModal = useCallback(
        (feature: IDataProviderFeature, tab: FeatureModalTab = 'config'): void => {
            setModalState({ open: true, feature, activeTab: tab });
        },
        [],
    );

    const openConfigByType = useCallback(
        (type: DataProviderFeatureType): void => {
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
        },
        [features, dataProviderId, provider],
    );

    const closeFeatureModal = useCallback((): void => {
        setModalState((prev) => ({ ...prev, open: false }));
    }, []);

    return {
        modalState,
        setModalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        handleSwitchStatus,
    };
};
