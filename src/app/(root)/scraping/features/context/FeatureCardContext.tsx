'use client';

import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { DataProviderFeatureStatus } from '../enums';
import type { IDataProviderFeature } from '../types';
import { FEATURE_TYPE_METADATA, type FeatureDefinition } from '../utils';

export interface FeatureCardContextValue {
    isReady: boolean;
    isError: boolean;
    isSwitchingStatus: boolean;
    feature: IDataProviderFeature;
    meta?: FeatureDefinition;
    onOpenConfig: () => void;
    onOpenHistory: () => void;
    onSwitchStatus: () => void;
}

export const FeatureCardContext = createContext<FeatureCardContextValue | null>(null);

export interface FeatureCardProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onOpenModal: (feature: IDataProviderFeature) => void;
    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
}

export const FeatureCardProvider = ({
    feature,
    isSwitchingStatus = false,
    children,
    onOpenModal,
    onOpenHistoryModal,
    onSwitchStatus,
}: FeatureCardProviderProps) => {
    const meta = useMemo(() => FEATURE_TYPE_METADATA[feature.type], [feature.type]);

    const isReady = useMemo(
        () => feature.status === DataProviderFeatureStatus.READY,
        [feature.status],
    );

    const isError = useMemo(
        () => feature.status === DataProviderFeatureStatus.ERROR || feature.consecutiveFailures > 0,
        [feature.status, feature.consecutiveFailures],
    );

    const onOpenConfig = useCallback(() => onOpenModal(feature), [onOpenModal, feature]);

    const onOpenHistory = useCallback(
        () => onOpenHistoryModal(feature),
        [onOpenHistoryModal, feature],
    );

    const handleSwitchStatus = useCallback(
        () => onSwitchStatus(feature.id, feature.status),
        [onSwitchStatus, feature.id, feature.status],
    );

    const value: FeatureCardContextValue = useMemo(
        () => ({
            feature,
            meta,
            isReady,
            isError,
            isSwitchingStatus,
            onOpenConfig,
            onOpenHistory,
            onSwitchStatus: handleSwitchStatus,
        }),
        [
            feature,
            isSwitchingStatus,
            meta,
            isReady,
            isError,
            onOpenConfig,
            onOpenHistory,
            handleSwitchStatus,
        ],
    );

    return <FeatureCardContext.Provider value={value}>{children}</FeatureCardContext.Provider>;
};

export const useFeatureCardContext = (): FeatureCardContextValue => {
    const context = useContext(FeatureCardContext);
    if (!context) {
        throw new Error('useFeatureCardContext must be used within a FeatureCardProvider');
    }
    return context;
};
