'use client';

import type { FormInstance } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_FEATURE_TEMPLATES, getDefaultFormValues } from '../constants';
import { ScraperServiceEnum } from '../enums';
import type { IConfigVersion, IDataProviderFeature, TargetConfig } from '../types';
import {
    buildFeatureMutationPayload,
    calculateFeatureConfigDiff,
    IFeatureDiffItem,
    mapConfigToBaseFormValues,
} from '../utils';

export interface UseFeatureModalControllerProps {
    open: boolean;
    form: FormInstance;
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export interface UseFeatureModalControllerReturn {
    isDraft: boolean;
    versions: IConfigVersion[];
    selectedVersion: IConfigVersion | null;
    selectedVersionId?: number;
    isViewingHistory: boolean;
    authorName: string | null;
    isLoading: boolean;
    loadingTip: string;
    isConfirmOpen: boolean;
    diffItems: IFeatureDiffItem[];
    pendingValues: Record<string, any> | null;
    handleCancelConfirm: () => void;
    setSelectedVersionId: (id?: number) => void;
    handleRollback: (targetVersionId?: number) => Promise<void>;
    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
    handleSave: (values: Record<string, any>) => Promise<void>;
    handleServiceChange: (service: ScraperServiceEnum) => void;
    handleConfirmUpdate: (changeDescription: string) => Promise<void>;
}

export const useFeatureModalController = ({
    open,
    feature,
    form,
    isSwitchingStatus = false,
    onClose,
    onSuccess,
}: UseFeatureModalControllerProps): UseFeatureModalControllerReturn => {
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [diffItems, setDiffItems] = useState<IFeatureDiffItem[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();
    const [pendingValues, setPendingValues] = useState<Record<string, any> | null>(null);

    const { data: versions = [], query: versionsQuery } = useCustomData<
        IConfigVersion[],
        IConfigVersion[]
    >({
        enabled: Boolean(open && feature.id),
        url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id),
        transform: (data) => (Array.isArray(data) ? data : []) as IConfigVersion[],
    });

    const isDraft = useMemo(() => !feature.id, [feature.id]);
    const activeVersion = useMemo(() => versions.find((v) => v.isActive), [versions]);

    const selectedVersion = useMemo(
        () => versions.find((v) => v.versionId === selectedVersionId) || activeVersion || null,
        [versions, selectedVersionId, activeVersion],
    );

    const isViewingHistory = useMemo(
        () => Boolean(selectedVersion && !selectedVersion.isActive),
        [selectedVersion],
    );

    const authorName = useMemo(() => {
        if (!selectedVersion) return null;
        if (selectedVersion.user) {
            const fullName = `${selectedVersion.user.firstName || ''} ${
                selectedVersion.user.lastName || ''
            }`.trim();
            return fullName || selectedVersion.user.email || selectedVersion.user.userName;
        }
        return selectedVersion.createdBy || null;
    }, [selectedVersion]);

    const isLoading = useMemo(() => {
        return (
            (versionsQuery.isLoading && !isDraft) ||
            mutation.mutation.isPending ||
            isSwitchingStatus
        );
    }, [versionsQuery.isLoading, mutation.mutation.isPending, isSwitchingStatus, isDraft]);

    const loadingTip = useMemo(() => {
        if (isSwitchingStatus) return 'Đang cập nhật trạng thái...';

        if (mutation.mutation.isPending) {
            return isConfirmOpen ? 'Đang lưu cấu hình...' : 'Đang khôi phục phiên bản...';
        }

        if (versionsQuery.isLoading && !isDraft) return 'Đang tải phiên bản cấu hình...';

        return 'Đang xử lý...';
    }, [
        isSwitchingStatus,
        isDraft,
        isConfirmOpen,
        versionsQuery.isLoading,
        mutation.mutation.isPending,
    ]);

    useEffect(() => {
        if (!open) {
            setSelectedVersionId(undefined);
            form.resetFields();
            return;
        }

        if (activeVersion && selectedVersionId === undefined) {
            setSelectedVersionId(activeVersion.versionId);
        }

        const config = (selectedVersion?.config || feature.config || {}) as TargetConfig;
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        const resolvedDefaultConfig = getDefaultFormValues({
            service,
            featureType: feature.type,
        });

        const defaultTemplate = DEFAULT_FEATURE_TEMPLATES[feature.type]?.[service] || '';

        const baseInitialValues = mapConfigToBaseFormValues({
            config,
            service,
            defaultTemplate,
            defaultConfig: resolvedDefaultConfig,
        });

        form.setFieldsValue(baseInitialValues);
    }, [open, form, feature, activeVersion, selectedVersionId, selectedVersion]);

    const handleRollback = useCallback(
        async (targetVersionId?: number) => {
            const vId = targetVersionId || selectedVersion?.versionId;
            if (!feature.id || !vId) return;

            await handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.CONFIG_VERSION_FEATURES.ROLLBACK(feature.id, vId),
                successNotification: () => {
                    onSuccess();
                    versionsQuery.refetch();

                    return {
                        type: MessageType.SUCCESS,
                        message: `Đã khôi phục về phiên bản v${vId}`,
                    };
                },
                errorNotification: (error) => ({
                    type: MessageType.ERROR,
                    description: error?.message,
                    message: 'Khôi phục phiên bản thất bại',
                }),
            });
        },
        [feature, selectedVersion, versionsQuery, handleCustomMutationData, onSuccess],
    );

    const executeSave = useCallback(
        async (values: Record<string, any>, changeDescription?: string): Promise<void> => {
            const valuesWithDesc = {
                ...values,
                ...(changeDescription ? { changeDescription } : {}),
            };

            const { method, endpoint, payload } = buildFeatureMutationPayload({
                feature,
                isDraft,
                featureLabel: 'tính năng',
                values: valuesWithDesc as any,
            });

            await handleCustomMutationData({
                method,
                url: endpoint,
                values: payload,
                successNotification: () => {
                    setIsConfirmOpen(false);
                    onSuccess();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: isDraft
                            ? 'Khởi tạo cấu hình thành công'
                            : 'Lưu cấu hình thành công',
                    };
                },
                errorNotification: (error) => ({
                    type: MessageType.ERROR,
                    description: error?.message,
                    message: isDraft ? 'Khởi tạo cấu hình thất bại' : 'Lưu cấu hình thất bại',
                }),
            });
        },
        [feature, isDraft, handleCustomMutationData, onSuccess, onClose],
    );

    const handleFormSubmit = useCallback(
        async (values: Record<string, any>): Promise<void> => {
            if (isDraft) {
                await executeSave(values);
                return;
            }
            const origConfig = (selectedVersion?.config || feature.config || {}) as Record<
                string,
                unknown
            >;
            const origService = selectedVersion?.config?.service || feature.service;
            const diffs = calculateFeatureConfigDiff(origConfig, origService, values);

            setPendingValues(values);
            setDiffItems(diffs);
            setIsConfirmOpen(true);
        },
        [isDraft, selectedVersion, feature, executeSave],
    );

    const handleServiceChange = useCallback(
        (service: ScraperServiceEnum) => {
            const template = DEFAULT_FEATURE_TEMPLATES[feature.type]?.[service] || '';
            form.setFieldValue('functionGenerator', template);
        },
        [feature.type, form],
    );

    const handleConfirmUpdate = useCallback(
        async (changeDescription: string): Promise<void> => {
            if (!pendingValues) return;
            await executeSave(pendingValues, changeDescription);
        },
        [pendingValues, executeSave],
    );

    const handleCancelConfirm = useCallback(() => {
        setIsConfirmOpen(false);
    }, []);

    return {
        isDraft,
        versions,
        selectedVersion,
        selectedVersionId,
        isViewingHistory,
        authorName,
        isLoading,
        loadingTip,
        isConfirmOpen,
        diffItems,
        pendingValues,
        setSelectedVersionId,
        handleRollback,
        handleFormSubmit,
        handleSave: handleFormSubmit,
        handleServiceChange,
        handleConfirmUpdate,
        handleCancelConfirm,
    };
};
