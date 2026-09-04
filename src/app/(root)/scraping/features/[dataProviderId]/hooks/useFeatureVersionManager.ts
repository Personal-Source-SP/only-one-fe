'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormInstance } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface UseFeatureVersionManagerProps {
    open: boolean;
    form: FormInstance;
    feature: IDataProviderFeature;
    onSuccess: () => void;
}

export const useFeatureVersionManager = ({
    open,
    form,
    feature,
    onSuccess,
}: UseFeatureVersionManagerProps) => {
    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number>();

    const { handleCustomMutationData } = useCustomMutationData();

    const { result: versionsResult, query: versionsQuery } = useCustomData({
        url: API_ENDPOINT.DATA_PROVIDER_FEATURES.VERSIONS(feature.id),
        enabled: Boolean(open && feature.id),
    });

    const { versions, activeVersion } = useMemo(() => {
        const list = (versionsResult?.data?.data || []) as IConfigVersion[];
        return {
            versions: list,
            activeVersion: list.find((v) => v.isActive),
        };
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
        (targetVersionId?: number) => {
            const vId = targetVersionId || selectedVersion?.versionId;
            if (!feature.id || !vId) return;

            setIsRollingBack(true);
            handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.DATA_PROVIDER_FEATURES.ROLLBACK(feature.id, vId),
                successNotification: () => {
                    onSuccess();
                    setIsRollingBack(false);
                    versionsQuery.refetch();

                    return {
                        type: MessageType.SUCCESS,
                        message: `Đã khôi phục về phiên bản v${vId}`,
                    };
                },
                errorNotification: (error) => {
                    setIsRollingBack(false);
                    return {
                        type: MessageType.ERROR,
                        description: error?.message,
                        message: 'Khôi phục phiên bản thất bại',
                    };
                },
            });
        },
        [feature, selectedVersion, versionsQuery, handleCustomMutationData, onSuccess],
    );

    return {
        versions,
        selectedVersion,
        selectedVersionId,
        isViewingHistory,
        isRollingBack,
        authorName,
        setSelectedVersionId,
        handleRollback,
    };
};
