'use client';

import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { FEATURE_REGISTRY, type FeatureDefinition } from '../constants';
import { DataProviderFeatureStatus } from '../enums';
import type { IDataProviderFeature } from '../types';

export interface FeatureCardContextValue {
    isReady: boolean;
    isError: boolean;
    meta: FeatureDefinition;
    isSwitchingStatus: boolean;
    feature: IDataProviderFeature;
    onOpenConfig: () => void;
    onOpenHistory: () => void;
    onSwitchStatus: (targetStatus: DataProviderFeatureStatus) => void;
}

export const FeatureCardContext = createContext<FeatureCardContextValue | null>(null);

export interface FeatureCardProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onOpenModal: (feature: IDataProviderFeature) => void;
    onOpenHistoryModal: (feature: IDataProviderFeature) => void;
    onSwitchStatus: (featureId: string, targetStatus: DataProviderFeatureStatus) => void;
}

export const FeatureCardProvider = ({
    feature,
    isSwitchingStatus = false,
    children,
    onOpenModal,
    onOpenHistoryModal,
    onSwitchStatus,
}: FeatureCardProviderProps) => {
    const meta = useMemo(() => FEATURE_REGISTRY[feature.type], [feature.type]);

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
        (targetStatus: DataProviderFeatureStatus) => onSwitchStatus(feature.id, targetStatus),
        [onSwitchStatus, feature.id],
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
