'use client';

import { customNotification } from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { useCallback, useMemo, useState } from 'react';
import { FEATURE_REGISTRY } from '../constants';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export type UseFeatureHistoryProps = {
    open: boolean;
    feature: IDataProviderFeature | null;
    onSuccess: () => void;
};

export const useFeatureHistory = ({ open, feature, onSuccess }: UseFeatureHistoryProps) => {
    const { handleCustomMutationData, mutation } = useCustomMutationData();
    const [selectedVersionId, setSelectedVersionId] = useState<number>();

    const featureId = useMemo(() => feature?.id || '', [feature]);
    const meta = useMemo(() => (feature ? FEATURE_REGISTRY[feature.type] : null), [feature]);

    const { data: sortedVersions = [], query } = useCustomData<IConfigVersion[], IConfigVersion[]>({
        enabled: Boolean(open && featureId),
        url: API_ENDPOINT.CONFIG_VERSION_FEATURES.VERSIONS(featureId),
        transform: (data) => {
            const list = (Array.isArray(data) ? data : []) as IConfigVersion[];
            return [...list].sort((a, b) => b.versionId - a.versionId);
        },
    });

    const currentSelectedVersion = useMemo(() => {
        if (selectedVersionId !== undefined) {
            return sortedVersions.find((v) => v.versionId === selectedVersionId) || null;
        }

        const activeVersion = sortedVersions.find((v) => v.isActive);
        return activeVersion || sortedVersions[0] || null;
    }, [selectedVersionId, sortedVersions]);

    const handleApply = useCallback(
        async (versionId: number) => {
            if (!featureId || !versionId) return;

            await handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.CONFIG_VERSION_FEATURES.ROLLBACK(featureId, versionId),
                successNotification: () => {
                    onSuccess();
                    query.refetch();

                    return {
                        type: MessageType.SUCCESS,
                        message: `Đã áp dụng thành công cấu hình phiên bản v${versionId}`,
                    };
                },
                errorNotification: (err) => ({
                    type: MessageType.ERROR,
                    message: 'Áp dụng phiên bản thất bại',
                    description: err?.message,
                }),
            });
        },
        [query, featureId, handleCustomMutationData, onSuccess],
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
        isLoading: query.isLoading || mutation.mutation.isPending,
        setSelectedVersionId,
        handleApply,
        handleCopyConfig,
    };
};
