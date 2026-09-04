'use client';

import {
    CustomButton,
    CustomEmpty,
    CustomFlex,
    CustomModal,
    CustomSpin,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureHistoryManager } from '../../hooks';
import type { IDataProviderFeature } from '../../types';
import { VersionDetail } from './VersionDetail';
import { VersionList } from './VersionList';

export type FeatureHistoryModalProps = {
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
    const {
        meta,
        sortedVersions,
        currentSelectedVersion,
        isApplying,
        isLoading,
        setSelectedVersionId,
        handleApply,
        handleCopyConfig,
    } = useFeatureHistoryManager({ open, feature, onSuccess });

    const modalTitle = (
        <CustomFlex align="center" gap="middle" className="pr-6">
            <CustomFlex
                align="center"
                justify="center"
                className={`p-2 rounded-xl shrink-0 ${
                    meta?.accentClass || 'text-hub-primary bg-hub-primary/10'
                }`}
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
            {isLoading ? (
                <CustomFlex justify="center" align="center" className="py-20">
                    <CustomSpin tip="Đang tải lịch sử cấu hình..." />
                </CustomFlex>
            ) : sortedVersions.length === 0 ? (
                <CustomEmpty description="Chưa có phiên bản lịch sử nào cho tính năng này." />
            ) : (
                <CustomFlex gap="middle" className="min-h-[480px]">
                    <VersionList
                        sortedVersions={sortedVersions}
                        currentSelectedVersion={currentSelectedVersion}
                        onSelectVersion={setSelectedVersionId}
                    />

                    <VersionDetail
                        currentSelectedVersion={currentSelectedVersion}
                        isApplying={isApplying}
                        onApply={handleApply}
                        onCopyConfig={handleCopyConfig}
                    />
                </CustomFlex>
            )}
        </CustomModal>
    );
};
