'use client';

import type { FormInstance } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface UseFeatureModalControllerProps {
    open: boolean;
    feature: IDataProviderFeature;
    form: FormInstance;
    isSwitchingStatus?: boolean;
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
    isGlobalLoading: boolean;
    loadingTip: string;
    setSelectedVersionId: (id?: number) => void;
    handleRollback: (targetVersionId?: number) => Promise<void>;
}

export const useFeatureModalController = ({
    open,
    feature,
    form,
    isSwitchingStatus = false,
    onSuccess,
}: UseFeatureModalControllerProps): UseFeatureModalControllerReturn => {
    const { handleCustomMutationData } = useCustomMutationData();

    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();

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
        () => (isLoadingVersions && !isDraft) || isRollingBack || isSwitchingStatus,
        [isLoadingVersions, isDraft, isRollingBack, isSwitchingStatus],
    );

    const loadingTip = useMemo(() => {
        if (isRollingBack) return 'Đang khôi phục phiên bản...';
        if (isSwitchingStatus) return 'Đang cập nhật trạng thái...';
        if (isLoadingVersions && !isDraft) return 'Đang tải phiên bản cấu hình...';
        return 'Đang xử lý...';
    }, [isRollingBack, isLoadingVersions, isDraft, isSwitchingStatus]);

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

    return {
        isDraft,
        versions,
        selectedVersion,
        selectedVersionId,
        isViewingHistory,
        authorName,
        isLoadingVersions,
        isRollingBack,
        isGlobalLoading,
        loadingTip,
        setSelectedVersionId,
        handleRollback,
    };
};
