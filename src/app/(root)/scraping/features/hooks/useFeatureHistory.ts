'use client';

import { useCallback, useMemo, useState } from 'react';
import { customNotification } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { FEATURE_TYPE_METADATA } from '../constants';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export type UseFeatureHistoryProps = {
    open: boolean;
    feature: IDataProviderFeature | null;
    onSuccess: () => void;
};

export const useFeatureHistory = ({ open, feature, onSuccess }: UseFeatureHistoryProps) => {
    const { handleCustomMutationData } = useCustomMutationData();

    const [isApplying, setIsApplying] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();

    const featureId = useMemo(() => feature?.id || '', [feature]);
    const meta = useMemo(() => (feature ? FEATURE_TYPE_METADATA[feature.type] : null), [feature]);

    const { result, query } = useCustomData({
        enabled: Boolean(open && featureId),
        url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(featureId),
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
                url: API_ENDPOINT.CONFIG_VERSION_FEATURES.ROLLBACK(featureId, versionId),
                successNotification: () => {
                    setIsApplying(false);
                    onSuccess();

                    query.refetch();

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
        customNotification.success({ message: 'Đã sao chép cấu hình JSON vào clipboard' });
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
