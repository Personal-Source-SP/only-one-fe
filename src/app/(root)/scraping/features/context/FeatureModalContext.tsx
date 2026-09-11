'use client';

import { CustomForm, type FormInstance } from '@/components/custom-antd';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { DataProviderFeatureStatus, ScraperServiceEnum } from '../enums';
import { useFeatureModalController } from '../hooks';
import type { IConfigVersion, IDataProviderFeature } from '../types';
import type { IFeatureDiffItem } from '../utils';

export interface FeatureModalContextValue {
    // Core Domain & Form
    open: boolean;
    form: FormInstance;
    feature: IDataProviderFeature;
    currentService: ScraperServiceEnum;

    // Versioning & History
    isDraft: boolean;
    isViewingHistory: boolean;
    versions: IConfigVersion[];
    selectedVersionId?: number;
    authorName: string | null;
    selectedVersion: IConfigVersion | null;

    // Loadings & Flags
    isSaving: boolean;
    loadingTip: string;
    isConfirmOpen: boolean;
    isRollingBack: boolean;
    isGlobalLoading: boolean;
    isSwitchingStatus?: boolean;
    diffItems: IFeatureDiffItem[];

    // Handlers
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus: () => void;
    onSelectVersion: (versionId?: number) => void;
    onRollback: (targetVersionId?: number) => Promise<void>;
    setSelectedVersionId: (id?: number) => void;
    handleCancelConfirm: () => void;
    handleRollback: (targetVersionId?: number) => Promise<void>;
    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
    handleSave: (values: Record<string, any>) => Promise<void>;
    handleServiceChange: (service: ScraperServiceEnum) => void;
}

export const FeatureModalContext = createContext<FeatureModalContextValue | null>(null);

export interface FeatureModalProviderProps extends PropsWithChildren {
    open: boolean;
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
}

export const FeatureModalProvider = ({
    open,
    feature,
    children,
    isSwitchingStatus = false,
    onClose,
    onSuccess,
    onSwitchStatus,
}: FeatureModalProviderProps) => {
    const [form] = CustomForm.useForm();
    const formService = CustomForm.useWatch('service', form);

    const controller = useFeatureModalController({
        open,
        form,
        feature,
        isSwitchingStatus,
        onClose,
        onSuccess,
    });

    const currentService = useMemo(() => {
        return (
            formService ||
            controller.selectedVersion?.config?.service ||
            feature.service ||
            ScraperServiceEnum.GENERIC
        );
    }, [formService, controller.selectedVersion, feature.service]);

    const value: FeatureModalContextValue = useMemo(
        () => ({
            open,
            feature,
            form,
            currentService,
            isSwitchingStatus,
            ...controller,
            onClose,
            onSuccess,
            onRollback: controller.handleRollback,
            onSelectVersion: controller.setSelectedVersionId,
            onSwitchStatus: () => onSwitchStatus(feature.id, feature.status),
        }),
        [
            open,
            feature,
            isSwitchingStatus,
            form,
            controller,
            currentService,
            onClose,
            onSuccess,
            onSwitchStatus,
        ],
    );

    return <FeatureModalContext.Provider value={value}>{children}</FeatureModalContext.Provider>;
};

export const useFeatureModalContext = (): FeatureModalContextValue => {
    const context = useContext(FeatureModalContext);
    if (!context) {
        throw new Error('useFeatureModal must be used within a FeatureModalProvider');
    }
    return context;
};
