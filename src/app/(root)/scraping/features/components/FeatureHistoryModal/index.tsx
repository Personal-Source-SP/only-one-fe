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
import { FEATURE_MODAL_WIDTH } from '../../constants';
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
                    className="w-10 h-10 rounded-xl bg-hub-primary/10 text-hub-primary shrink-0"
                >
                    <Icon icon={meta?.icon || 'lucide:history'} className="text-xl" />
                </CustomFlex>

                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small">
                        <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
                            Lịch sử Cấu hình & Khôi phục Snapshot
                        </CustomTypography.Title>
                        {feature?.service && (
                            <CustomTag color="blue" className="font-mono text-xs">
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
            title={modalTitle}
            width={FEATURE_MODAL_WIDTH}
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
