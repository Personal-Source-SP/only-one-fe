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
import { FEATURE_MODAL_WIDTH, SCRAPER_SERVICE_LABELS } from '../../constants';
import { useFeatureHistoryContext } from '../../context';
import { ScraperServiceEnum } from '../../enums';
import { VersionDetail } from './VersionDetail';
import { VersionList } from './VersionList';

export const FeatureHistoryModal = () => {
    const { open, feature, meta, sortedVersions, isLoading, onClose } = useFeatureHistoryContext();

    const serviceLabel = useMemo(() => {
        if (!feature?.service) return null;
        return SCRAPER_SERVICE_LABELS[feature.service as ScraperServiceEnum] || feature.service;
    }, [feature?.service]);

    const modalTitle = useMemo<ReactNode>(
        () => (
            <CustomFlex
                justify="space-between"
                align="center"
                className="w-full pr-6 flex-wrap gap-2"
            >
                <CustomFlex align="center" gap="middle">
                    <CustomFlex
                        align="center"
                        justify="center"
                        className={`p-2 rounded-xl shrink-0 ${meta?.accentClass || 'text-hub-primary bg-hub-primary/10'}`}
                    >
                        <Icon icon={meta?.icon || 'lucide:history'} className="text-lg" />
                    </CustomFlex>

                    <CustomFlex align="center" gap="small">
                        <CustomTypography.Text strong className="text-base text-hub-title">
                            Lịch sử Cấu hình: {meta?.label || 'Tính năng'}
                        </CustomTypography.Text>
                        {serviceLabel && (
                            <CustomTag color="blue" className="font-medium text-xs m-0">
                                {serviceLabel}
                            </CustomTag>
                        )}
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>
        ),
        [meta, serviceLabel],
    );

    return (
        <CustomModal
            open={open}
            onCancel={onClose}
            title={modalTitle}
            width={FEATURE_MODAL_WIDTH}
            bodyClassName="!p-2.5 sm:!p-4"
            className="top-6 max-w-[96vw]"
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
