'use client';

import { useMemo, useState } from 'react';
import {
    CustomButton,
    CustomEmpty,
    CustomFlex,
    CustomModal,
    CustomPopconfirm,
    CustomSpin,
    CustomTag,
    CustomTypography,
    customNotification,
} from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { ConfigVersionType, MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { FEATURE_TYPE_METADATA } from '../constants';
import type { IConfigVersion, IDataProviderFeature } from '../types';

type FeatureHistoryModalProps = {
    open: boolean;
    feature: IDataProviderFeature | null;
    onClose: () => void;
    onSuccess: () => void;
};

export const FeatureHistoryModal = ({
    open,
    feature,
    onClose,
    onSuccess,
}: FeatureHistoryModalProps) => {
    const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();
    const [isApplying, setIsApplying] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const featureId = feature?.id || '';
    const meta = feature ? FEATURE_TYPE_METADATA[feature.type] : null;

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

    const handleApply = (versionId: number) => {
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
    };

    const handleCopyConfig = () => {
        if (!currentSelectedVersion?.config) return;
        navigator.clipboard.writeText(JSON.stringify(currentSelectedVersion.config, null, 2));
        customNotification.success({
            message: 'Đã sao chép cấu hình JSON vào clipboard',
        });
    };

    const renderChangeTypeTag = (type: ConfigVersionType) => {
        switch (type) {
            case ConfigVersionType.AI_GENERATED:
                return (
                    <CustomTag color="purple" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:sparkles" className="w-3 h-3" />
                        AI tạo
                    </CustomTag>
                );
            case ConfigVersionType.ROLLBACK:
                return (
                    <CustomTag color="orange" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:history" className="w-3 h-3" />
                        Khôi phục
                    </CustomTag>
                );
            case ConfigVersionType.MANUAL_EDIT:
            default:
                return (
                    <CustomTag color="blue" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:edit-3" className="w-3 h-3" />
                        Thủ công
                    </CustomTag>
                );
        }
    };

    const modalTitle = (
        <CustomFlex align="center" gap="middle" className="pr-6">
            <CustomFlex
                align="center"
                justify="center"
                className={`p-2 rounded-xl shrink-0 ${meta?.accentClass || 'text-hub-primary bg-hub-primary/10'}`}
            >
                <Icon icon="lucide:history" className="text-lg" />
            </CustomFlex>
            <CustomFlex vertical gap={2}>
                <CustomFlex align="center" gap="small">
                    <CustomTypography.Text strong className="text-base text-hub-title">
                        Lịch sử cấu hình: {meta?.label || feature?.type}
                    </CustomTypography.Text>
                    {feature?.service && (
                        <CustomTag className="font-mono text-xs m-0">{feature.service}</CustomTag>
                    )}
                </CustomFlex>
                <CustomTypography.Text type="secondary" className="text-xs">
                    Theo dõi lịch sử chỉnh sửa và khôi phục snapshot cấu hình trước đó
                </CustomTypography.Text>
            </CustomFlex>
        </CustomFlex>
    );

    return (
        <CustomModal
            open={open}
            title={modalTitle}
            width={1000}
            onCancel={onClose}
            footer={
                <CustomFlex justify="end">
                    <CustomButton onClick={onClose}>Đóng</CustomButton>
                </CustomFlex>
            }
        >
            {query.isLoading ? (
                <CustomFlex justify="center" align="center" className="py-20">
                    <CustomSpin tip="Đang tải lịch sử cấu hình..." />
                </CustomFlex>
            ) : sortedVersions.length === 0 ? (
                <CustomEmpty description="Chưa có phiên bản lịch sử nào cho tính năng này." />
            ) : (
                <CustomFlex gap="middle" className="min-h-[480px]">
                    {/* Left Pane: Version List */}
                    <CustomFlex
                        vertical
                        gap="small"
                        className="w-[360px] shrink-0 border-r border-gray-100 dark:border-gray-800 pr-3 overflow-y-auto max-h-[520px]"
                    >
                        <CustomTypography.Text
                            strong
                            className="text-xs text-hub-subtitle uppercase tracking-wider mb-1"
                        >
                            Danh sách phiên bản ({sortedVersions.length})
                        </CustomTypography.Text>
                        {sortedVersions.map((v) => {
                            const isSelected = currentSelectedVersion?.versionId === v.versionId;
                            const authorName = v.user
                                ? `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() ||
                                  v.user.email
                                : v.createdBy || 'Hệ thống';

                            return (
                                <div
                                    key={v.id || v.versionId}
                                    onClick={() => setSelectedVersionId(v.versionId)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                                        isSelected
                                            ? 'border-hub-primary bg-hub-primary/5 shadow-xs'
                                            : 'border-gray-200/70 dark:border-gray-800 hover:border-hub-primary/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                                    }`}
                                >
                                    <CustomFlex
                                        justify="space-between"
                                        align="center"
                                        className="mb-1.5"
                                    >
                                        <CustomFlex align="center" gap="small">
                                            <span className="font-bold text-sm font-mono text-hub-title">
                                                v{v.versionId}
                                            </span>
                                            {v.isActive && (
                                                <CustomTag
                                                    color="success"
                                                    className="m-0 font-medium text-xs"
                                                >
                                                    Đang dùng
                                                </CustomTag>
                                            )}
                                        </CustomFlex>
                                        {renderChangeTypeTag(v.changeType)}
                                    </CustomFlex>

                                    <CustomTypography.Paragraph
                                        ellipsis={{ rows: 2 }}
                                        className="!mb-2 text-xs text-hub-title"
                                    >
                                        {v.changeDescription || 'Chỉnh sửa cấu hình'}
                                    </CustomTypography.Paragraph>

                                    <CustomFlex
                                        justify="space-between"
                                        align="center"
                                        className="text-xs text-hub-subtitle"
                                    >
                                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                                            <Icon icon="lucide:user" className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{authorName}</span>
                                        </span>
                                        <span className="flex items-center gap-1 shrink-0">
                                            <Icon icon="lucide:clock" className="w-3 h-3" />
                                            {formatDate(v.createdAt)}
                                        </span>
                                    </CustomFlex>
                                </div>
                            );
                        })}
                    </CustomFlex>

                    {/* Right Pane: Details & Config Viewer */}
                    <CustomFlex
                        vertical
                        className="flex-1 pl-2 max-h-[520px] overflow-y-auto"
                        gap="middle"
                    >
                        {currentSelectedVersion ? (
                            <>
                                <CustomFlex justify="space-between" align="center" wrap gap="small">
                                    <CustomFlex vertical gap={2}>
                                        <CustomFlex align="center" gap="small">
                                            <CustomTypography.Title
                                                level={5}
                                                className="!mb-0 text-hub-title font-bold"
                                            >
                                                Phiên bản v{currentSelectedVersion.versionId}
                                            </CustomTypography.Title>
                                            {currentSelectedVersion.isActive ? (
                                                <CustomTag
                                                    color="success"
                                                    className="font-medium m-0"
                                                >
                                                    Đang áp dụng trên hệ thống
                                                </CustomTag>
                                            ) : (
                                                <CustomTag
                                                    color="default"
                                                    className="font-medium m-0"
                                                >
                                                    Snapshot lịch sử
                                                </CustomTag>
                                            )}
                                        </CustomFlex>
                                        <CustomTypography.Text type="secondary" className="text-xs">
                                            Mô tả:{' '}
                                            {currentSelectedVersion.changeDescription ||
                                                'Không có mô tả chi tiết'}
                                        </CustomTypography.Text>
                                    </CustomFlex>

                                    <CustomFlex align="center" gap="small">
                                        <CustomButton
                                            icon={<Icon icon="lucide:copy" />}
                                            onClick={handleCopyConfig}
                                        >
                                            Copy JSON
                                        </CustomButton>
                                        {!currentSelectedVersion.isActive && (
                                            <CustomPopconfirm
                                                title={`Áp dụng cấu hình phiên bản v${currentSelectedVersion.versionId}?`}
                                                description="Cấu hình hiện tại sẽ được cập nhật và tạo snapshot mới."
                                                okText="Xác nhận áp dụng"
                                                cancelText="Hủy"
                                                onConfirm={() =>
                                                    handleApply(currentSelectedVersion.versionId)
                                                }
                                            >
                                                <CustomButton
                                                    type="primary"
                                                    icon={<Icon icon="lucide:rotate-ccw" />}
                                                    loading={isApplying}
                                                    className="bg-hub-primary"
                                                >
                                                    Áp dụng phiên bản này
                                                </CustomButton>
                                            </CustomPopconfirm>
                                        )}
                                    </CustomFlex>
                                </CustomFlex>

                                {/* JSON Snapshot Box */}
                                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 p-4 font-mono text-xs overflow-auto max-h-[380px] shadow-inner">
                                    <pre className="m-0 leading-relaxed">
                                        {JSON.stringify(
                                            currentSelectedVersion.config || {},
                                            null,
                                            2,
                                        )}
                                    </pre>
                                </div>
                            </>
                        ) : null}
                    </CustomFlex>
                </CustomFlex>
            )}
        </CustomModal>
    );
};
