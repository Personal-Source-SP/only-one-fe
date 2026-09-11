'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useCallback, useEffect } from 'react';
import { FEATURE_MODAL_WIDTH } from '../../constants';
import { useFeatureModalContext } from '../../context';

export const FeatureConfirmUpdateModal = () => {
    const [form] = CustomForm.useForm();

    const {
        isConfirmOpen,
        isLoading,
        diffItems,
        selectedVersion,
        selectedVersionId,
        handleCancelConfirm,
        handleConfirmUpdate,
    } = useFeatureModalContext();

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

                {diffItems.length === 0 ? (
                    <CustomAlert
                        showIcon
                        type="info"
                        title="Không phát hiện thay đổi"
                        description="Các giá trị trên form hoàn toàn trùng khớp với phiên bản hiện tại. Việc lưu lại vẫn sẽ tạo một snapshot ghi chú mới."
                    />
                ) : (
                    <CustomFlex
                        vertical
                        gap="small"
                        className="w-full max-h-[420px] overflow-y-auto custom-scrollbar border border-hub-border/60 rounded-lg p-3 bg-hub-gray/30"
                    >
                        {diffItems.map((item) => (
                            <CodeDisplay
                                maxHeight="220px"
                                key={item.key}
                                title={item.label}
                                code={String(item.oldValue ?? '')}
                                compareCode={String(item.newValue ?? '')}
                                compareVersion={selectedVersion?.versionId ?? selectedVersionId}
                                language={
                                    item.codeLanguage ||
                                    (['headers', 'cookies'].includes(item.key)
                                        ? 'json'
                                        : 'javascript')
                                }
                            />
                        ))}
                    </CustomFlex>
                )}

                <CustomForm form={form} layout="vertical" onFinish={handleFinish} className="mt-2">
                    <CustomForm.Item
                        name="changeDescription"
                        label="Lý do thay đổi phiên bản (Change Log)"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập lý do thay đổi trước khi lưu snapshot',
                            },
                        ]}
                        className="!mb-0"
                    >
                        <CustomInput.TextArea
                            rows={3}
                            placeholder="Ví dụ: Cập nhật selector giá mới theo layout 2026, tăng timeout lên 30s..."
                        />
                    </CustomForm.Item>
                </CustomForm>
            </CustomFlex>
        </CustomModal>
    );
};
