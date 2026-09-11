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
import { ReactNode, useMemo } from 'react';
import { useFeatureHistoryContext } from '../../context';
import { VersionDetail } from './VersionDetail';
import { VersionList } from './VersionList';

export const FeatureHistoryModal = () => {
    const { open, feature, meta, sortedVersions, isLoading, onClose } = useFeatureHistoryContext();

    const modalTitle = useMemo<ReactNode>(
        () => (
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
                            <CustomTag className="font-mono text-xs m-0">
                                {feature.service}
                            </CustomTag>
                        )}
                    </CustomFlex>
                    <CustomTypography.Text type="secondary" className="text-xs">
                        Theo dõi lịch sử chỉnh sửa và khôi phục snapshot cấu hình trước đó
                    </CustomTypography.Text>
                </CustomFlex>
            </CustomFlex>
        ),
        [meta, feature],
    );

    return (
        <CustomModal
            open={open}
            width={1000}
            title={modalTitle}
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
                    <VersionList />
                    <VersionDetail />
                </CustomFlex>
            )}
        </CustomModal>
    );
};
