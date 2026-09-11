'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { FormInstance } from '@/components/custom-antd';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface FeatureModalContextValue {
    feature: IDataProviderFeature;
    form: FormInstance;
    selectedVersion: IConfigVersion | null;
    selectedVersionId?: number;
    isViewingHistory: boolean;
    isDraft: boolean;
    isRollingBack: boolean;
    isSaving: boolean;
    authorName: string | null;
    versions: IConfigVersion[];
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus?: () => void;
    onRollback: (versionId?: number) => Promise<void>;
    onSelectVersion: (versionId: number) => void;
    onSaveForm: (values: Record<string, any>) => Promise<void>;
}

export const FeatureModalContext = createContext<FeatureModalContextValue | null>(null);

export interface FeatureModalProviderProps {
    value: FeatureModalContextValue;
    children: ReactNode;
}

export const FeatureModalProvider = ({ value, children }: FeatureModalProviderProps) => {
    return <FeatureModalContext.Provider value={value}>{children}</FeatureModalContext.Provider>;
};

export const useFeatureModalContext = (): FeatureModalContextValue => {
    const context = useContext(FeatureModalContext);
    if (!context) {
        throw new Error('useFeatureModalContext must be used within a FeatureModalProvider');
    }
    return context;
};
