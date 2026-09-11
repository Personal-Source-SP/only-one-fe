'use client';

import type { FormInstance } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IConfigVersion, IDataProviderFeature } from '../types';
import {
    buildFeatureMutationPayload,
    calculateFeatureConfigDiff,
    IFeatureDiffItem,
} from '../utils';

export interface UseFeatureModalControllerProps {
    open: boolean;
    feature: IDataProviderFeature;
    form: FormInstance;
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
    isLoadingVersions: boolean;
    isRollingBack: boolean;
    isSaving: boolean;
    loadingTip: string;
    isConfirmOpen: boolean;
    isGlobalLoading: boolean;
    diffItems: IFeatureDiffItem[];
    handleCancelConfirm: () => void;
    setSelectedVersionId: (id?: number) => void;
    handleRollback: (targetVersionId?: number) => Promise<void>;
    handleFormSubmit: (values: Record<string, any>) => Promise<void>;
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
    const { handleCustomMutationData } = useCustomMutationData();

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [diffItems, setDiffItems] = useState<IFeatureDiffItem[]>([]);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();
    const [pendingValues, setPendingValues] = useState<Record<string, any> | null>(null);

    const { result: versionsResult, query: versionsQuery } = useCustomData({
        enabled: Boolean(open && feature.id),
        url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(feature.id),
    });

    const isDraft = useMemo(() => !feature.id, [feature.id]);

    const { versions, activeVersion } = useMemo(() => {
        const list = (versionsResult?.data?.data || []) as IConfigVersion[];
        return { versions: list, activeVersion: list.find((v) => v.isActive) };
    }, [versionsResult]);

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

    const isLoadingVersions = Boolean(versionsQuery.isLoading);

    const isGlobalLoading = useMemo(
        () => (isLoadingVersions && !isDraft) || isRollingBack || isSwitchingStatus || isSaving,
        [isLoadingVersions, isDraft, isRollingBack, isSaving, isSwitchingStatus],
    );

    const loadingTip = useMemo(() => {
        if (isSwitchingStatus) return 'Đang cập nhật trạng thái...';
        if (isRollingBack) return 'Đang khôi phục phiên bản...';
        if (isLoadingVersions && !isDraft) return 'Đang tải phiên bản cấu hình...';
        if (isSaving) return 'Đang lưu cấu hình...';
        return 'Đang xử lý...';
    }, [isRollingBack, isLoadingVersions, isDraft, isSwitchingStatus, isSaving]);

    useEffect(() => {
        if (open && activeVersion) {
            setSelectedVersionId(activeVersion.versionId);
            return;
        }

        if (!open) {
            setSelectedVersionId(undefined);
            form.resetFields();
        }
    }, [open, form, activeVersion]);

    const handleRollback = useCallback(
        async (targetVersionId?: number) => {
            const vId = targetVersionId || selectedVersion?.versionId;
            if (!feature.id || !vId) return;

            setIsRollingBack(true);
            try {
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
            } finally {
                setIsRollingBack(false);
            }
        },
        [feature, selectedVersion, versionsQuery, handleCustomMutationData, onSuccess],
    );

    const executeSave = useCallback(
        async (values: Record<string, any>, changeDescription?: string): Promise<void> => {
            setIsSaving(true);
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

            try {
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
            } finally {
                setIsSaving(false);
            }
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
        isLoadingVersions,
        isRollingBack,
        isSaving,
        isConfirmOpen,
        diffItems,
        isGlobalLoading,
        loadingTip,
        setSelectedVersionId,
        handleRollback,
        handleFormSubmit,
        handleConfirmUpdate,
        handleCancelConfirm,
    };
};
