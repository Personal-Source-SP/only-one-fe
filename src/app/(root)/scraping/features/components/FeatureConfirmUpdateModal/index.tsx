'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomModal,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useCallback, useEffect } from 'react';
import { FEATURE_MODAL_WIDTH } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { FeatureChangedFieldsList } from './FeatureChangedFieldsList';
import { FeatureChangeLogForm } from './FeatureChangeLogForm';

export const FeatureConfirmUpdateModal = () => {
    const [form] = CustomForm.useForm();

    const { isConfirmOpen, isLoading, handleCancelConfirm, handleConfirmUpdate } =
        useFeatureModalContext();

    useEffect(() => {
        if (isConfirmOpen) {
            form.resetFields();
        }
    }, [isConfirmOpen, form]);

    const handleFinish = useCallback(
        async (values: { changeDescription: string }) => {
            await handleConfirmUpdate(values.changeDescription);
        },
        [handleConfirmUpdate],
    );

    return (
        <CustomModal
            loading={isLoading}
            open={isConfirmOpen}
            closable={!isLoading}
            keyboard={!isLoading}
            width={FEATURE_MODAL_WIDTH}
            onCancel={handleCancelConfirm}
            loadingTip="Đang lưu và tạo phiên bản snapshot mới..."
            title={
                <CustomFlex align="center" gap={8}>
                    <Icon icon="lucide:git-compare" className="text-xl text-hub-primary" />
                    <CustomTypography.Title level={5} className="!mb-0 !font-semibold">
                        Xác nhận Cập nhật & Tạo Phiên bản Mới
                    </CustomTypography.Title>
                </CustomFlex>
            }
            footer={
                <CustomFlex justify="flex-end" gap={8}>
                    <CustomButton onClick={handleCancelConfirm} disabled={isLoading}>
                        Quay lại chỉnh sửa
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        loading={isLoading}
                        onClick={() => form.submit()}
                        icon={<Icon icon="lucide:check" />}
                    >
                        Xác nhận & Cập nhật
                    </CustomButton>
                </CustomFlex>
            }
        >
            <CustomFlex vertical gap="middle" className="w-full py-2">
                <CustomTypography.Text type="secondary" className="text-xs sm:text-sm">
                    Vui lòng kiểm tra lại các thông số cấu hình đã thay đổi và nhập lý do trước khi
                    lưu snapshot mới.
                </CustomTypography.Text>

                <FeatureChangedFieldsList />

                <FeatureChangeLogForm form={form} onFinish={handleFinish} />
            </CustomFlex>
        </CustomModal>
    );
};
