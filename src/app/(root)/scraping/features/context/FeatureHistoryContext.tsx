'use client';

import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useFeatureHistory } from '../hooks';
import type { IConfigVersion, IDataProviderFeature } from '../types';
import type { FeatureDefinition } from '../constants';

export interface FeatureHistoryContextValue {
    open: boolean;
    isApplying: boolean;
    isLoading: boolean;
    meta: FeatureDefinition | null;
    sortedVersions: IConfigVersion[];
    feature: IDataProviderFeature | null;
    currentSelectedVersion: IConfigVersion | null;
    onClose: () => void;
    handleCopyConfig: () => void;
    handleApply: (versionId: number) => void;
    setSelectedVersionId: (versionId: number) => void;
}

export const FeatureHistoryContext = createContext<FeatureHistoryContextValue | null>(null);

export interface FeatureHistoryProviderProps extends PropsWithChildren {
    open: boolean;
    feature: IDataProviderFeature | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const FeatureHistoryProvider = ({
    open,
    feature,
    onClose,
    onSuccess,
    children,
}: FeatureHistoryProviderProps) => {
    const historyState = useFeatureHistory({ open, feature, onSuccess });

    const value: FeatureHistoryContextValue = useMemo(
        () => ({
            open,
            feature,
            onClose,
            ...historyState,
        }),
        [open, feature, onClose, historyState],
    );

    return (
        <FeatureHistoryContext.Provider value={value}>{children}</FeatureHistoryContext.Provider>
    );
};

export const useFeatureHistoryContext = (): FeatureHistoryContextValue => {
    const context = useContext(FeatureHistoryContext);
    if (!context) {
        throw new Error('useFeatureHistoryContext must be used within a FeatureHistoryProvider');
    }
    return context;
};
