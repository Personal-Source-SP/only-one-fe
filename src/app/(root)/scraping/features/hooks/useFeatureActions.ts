'use client';

import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { useCallback, useState } from 'react';

import { DataProviderFeatureStatus, DataProviderFeatureType } from '../enums';
import type { FeatureModalState, IDataProviderFeature } from '../types';
import { createDefaultDraftFeature } from '../utils';

export type UseFeatureActionsProps = {
    dataProviderId: string;
    provider: IDataProvider;
    features: IDataProviderFeature[];
    refetchAll: () => Promise<void>;
};

export const useFeatureActions = ({
    dataProviderId,
    provider,
    features,
    refetchAll,
}: UseFeatureActionsProps) => {
    const { handleCustomMutationData } = useCustomMutationData();

    const [switchingFeatureId, setSwitchingFeatureId] = useState<string | null>(null);
    const [modalState, setModalState] = useState<FeatureModalState>({
        open: false,
        feature: null,
    });

    const handleSwitchStatus = useCallback(
        async (featureId: string, currentStatus: DataProviderFeatureStatus): Promise<void> => {
            const nextStatus =
                currentStatus === DataProviderFeatureStatus.READY
                    ? DataProviderFeatureStatus.DISABLED
                    : DataProviderFeatureStatus.READY;

            setSwitchingFeatureId(featureId);
            try {
                await handleCustomMutationData({
                    method: 'put',
                    url: API_ENDPOINT.DATA_PROVIDER_FEATURES.SWITCH_STATUS(featureId, nextStatus),
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
            } finally {
                setSwitchingFeatureId(null);
            }
        },
        [handleCustomMutationData, refetchAll],
    );

    const openFeatureModal = useCallback((feature: IDataProviderFeature): void => {
        setModalState({ open: true, feature });
    }, []);

    const openConfigByType = useCallback(
        (type: DataProviderFeatureType): void => {
            const existing = features.find((f) => f.type === type);
            if (existing) {
                setModalState({ open: true, feature: existing });
                return;
            }

            const draftFeature = createDefaultDraftFeature({
                dataProviderId,
                type,
                provider: provider,
            });
            setModalState({ open: true, feature: draftFeature });
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
        switchingFeatureId,
        isSwitchingStatus: Boolean(switchingFeatureId),
    };
};
