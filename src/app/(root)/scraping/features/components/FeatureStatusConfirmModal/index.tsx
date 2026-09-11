'use client';

import { CustomButton, CustomFlex, CustomModal, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { DATA_PROVIDER_FEATURE_STATUS_CONFIG } from '../../constants';
import { DataProviderFeatureStatus } from '../../enums';
import { StatusConfirmAlert } from './StatusConfirmAlert';
import { StatusTransitionVisualMap } from './StatusTransitionVisualMap';

export type FeatureStatusConfirmModalProps = {
    open: boolean;
    currentStatus: DataProviderFeatureStatus;
    targetStatus: DataProviderFeatureStatus | null;
    loading?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export const FeatureStatusConfirmModal = ({
    open,
    currentStatus,
    targetStatus,
    loading = false,
    onCancel,
    onConfirm,
}: FeatureStatusConfirmModalProps) => {
    if (!targetStatus) return null;

    const currentConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[currentStatus];
    const targetConfig = DATA_PROVIDER_FEATURE_STATUS_CONFIG[targetStatus];

    const modalTitle = targetConfig?.confirmTitle || 'Xác nhận Chuyển đổi Trạng thái';
    const warningMessage =
        targetConfig?.confirmWarning ||
        `Bạn có chắc chắn muốn chuyển trạng thái từ "${currentConfig?.label}" sang "${targetConfig?.label}"?`;

    return (
        <CustomModal
            centered
            open={open}
            width={720}
            loading={loading}
            closable={!loading}
            keyboard={!loading}
            onCancel={onCancel}
            loadingTip="Đang thực hiện chuyển đổi trạng thái..."
            title={
                <CustomFlex align="center" gap={8}>
                    <Icon
                        icon={targetConfig?.icon || 'lucide:refresh-cw'}
                        className="text-lg text-hub-primary"
                    />
                    <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
                        {modalTitle}
                    </CustomTypography.Title>
                </CustomFlex>
            }
            footer={
                <CustomFlex justify="flex-end" gap={8}>
                    <CustomButton onClick={onCancel} disabled={loading}>
                        Hủy bỏ
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        loading={loading}
                        onClick={onConfirm}
                        icon={<Icon icon="lucide:check" />}
                    >
                        Xác nhận Chuyển
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomFlex vertical gap="middle" className="w-full py-2">
                <StatusTransitionVisualMap
                    currentConfig={currentConfig}
                    targetConfig={targetConfig}
                />
                <StatusConfirmAlert targetConfig={targetConfig} warningMessage={warningMessage} />
            </CustomFlex>
        </CustomModal>
    );
};
