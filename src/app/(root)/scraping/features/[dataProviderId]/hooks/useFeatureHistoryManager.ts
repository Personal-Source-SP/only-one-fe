'use client';

import { useCallback, useMemo, useState } from 'react';
import { customNotification } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { FEATURE_TYPE_METADATA } from '../constants';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export type UseFeatureHistoryManagerProps = {
    open: boolean;
    feature: IDataProviderFeature | null;
    onSuccess: () => void;
};

export const useFeatureHistoryManager = ({
    open,
    feature,
    onSuccess,
}: UseFeatureHistoryManagerProps) => {
    const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const featureId = feature?.id || '';
    const meta = useMemo(() => (feature ? FEATURE_TYPE_METADATA[feature.type] : null), [feature]);

    const { result, query } = useCustomData({
        url: API_ENDPOINT.DATA_PROVIDER_FEATURES.VERSIONS(featureId),
        enabled: Boolean(open && featureId),
    });

    const versions = useMemo(() => (result?.data?.data || []) as IConfigVersion[], [result]);

    const sortedVersions = useMemo(() => {
        return [...versions].sort((a, b) => b.versionId - a.versionId);
    }, [versions]);

    const activeVersion = useMemo(() => versions.find((v) => v.isActive), [versions]);

    const currentSelectedVersion = useMemo(() => {
        if (selectedVersionId !== undefined) {
            return sortedVersions.find((v) => v.versionId === selectedVersionId) || null;
        }
        return activeVersion || sortedVersions[0] || null;
    }, [selectedVersionId, sortedVersions, activeVersion]);

    const handleApply = useCallback(
        (versionId: number) => {
            if (!featureId || !versionId) return;
            setIsApplying(true);
            handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.DATA_PROVIDER_FEATURES.ROLLBACK(featureId, versionId),
                successNotification: () => {
                    setIsApplying(false);
                    query.refetch();
                    onSuccess();
                    return {
                        type: MessageType.SUCCESS,
                        message: `Đã áp dụng thành công cấu hình phiên bản v${versionId}`,
                    };
                },
                errorNotification: (err) => {
                    setIsApplying(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Áp dụng phiên bản thất bại',
                        description: err?.message,
                    };
                },
            });
        },
        [featureId, handleCustomMutationData, query, onSuccess],
    );

    const handleCopyConfig = useCallback(() => {
        if (!currentSelectedVersion?.config) return;
        navigator.clipboard.writeText(JSON.stringify(currentSelectedVersion.config, null, 2));
        customNotification.success({
            message: 'Đã sao chép cấu hình JSON vào clipboard',
        });
    }, [currentSelectedVersion]);

    return {
        meta,
        sortedVersions,
        currentSelectedVersion,
        isApplying,
        isLoading: query.isLoading,
        setSelectedVersionId,
        handleApply,
        handleCopyConfig,
    };
};
