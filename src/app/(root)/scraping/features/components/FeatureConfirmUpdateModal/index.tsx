'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo } from 'react';
import { FEATURE_MODAL_WIDTH } from '../../constants';
import { useFeatureModalContext } from '../../context';
import type { IFeatureDiffItem } from '../../utils';

export const FeatureConfirmUpdateModal = () => {
    const [form] = CustomForm.useForm();

    const { isConfirmOpen, isSaving, diffItems, handleCancelConfirm, handleConfirmUpdate } =
        useFeatureModalContext();

    useEffect(() => {
        if (isConfirmOpen) {
            form.resetFields();
        }
    }, [isConfirmOpen, form]);

    const codeDiffItems = useMemo(() => diffItems.filter((item) => item.isCode), [diffItems]);
    const standardDiffItems = useMemo(() => diffItems.filter((item) => !item.isCode), [diffItems]);

    const handleFinish = useCallback(
        async (values: { changeDescription: string }) => {
            await handleConfirmUpdate(values.changeDescription);
        },
        [handleConfirmUpdate],
    );

    return (
        <CustomModal
            loading={isSaving}
            open={isConfirmOpen}
            closable={!isSaving}
            keyboard={!isSaving}
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
                    <CustomButton onClick={handleCancelConfirm} disabled={isSaving}>
                        Quay lại chỉnh sửa
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        loading={isSaving}
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
                        {standardDiffItems.length > 0 && (
                            <>
                                <CustomFlex
                                    align="center"
                                    justify="space-between"
                                    className="border-b border-hub-border pb-2"
                                >
                                    <CustomTypography.Text
                                        strong
                                        className="text-xs uppercase tracking-wider text-hub-subtitle"
                                    >
                                        Thông số cấu hình thay đổi ({standardDiffItems.length})
                                    </CustomTypography.Text>
                                </CustomFlex>

                                {standardDiffItems.map((item) => (
                                    <CustomFlex
                                        gap={4}
                                        vertical
                                        key={item.key}
                                        className="border-b border-hub-border/40 last:border-0 pb-2.5 pt-1"
                                    >
                                        <CustomFlex align="center" gap={6}>
                                            <CustomTag
                                                color="blue"
                                                className="text-[11px] font-medium !m-0"
                                            >
                                                {item.section}
                                            </CustomTag>
                                            <CustomTypography.Text
                                                strong
                                                className="text-xs text-hub-title"
                                            >
                                                {item.label}
                                            </CustomTypography.Text>
                                        </CustomFlex>

                                        <CustomFlex align="center" gap={8} className="text-xs pl-2">
                                            <div className="flex-1 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded px-2 py-1 font-mono text-[11px] truncate">
                                                <span className="font-semibold select-none mr-1">
                                                    [-]
                                                </span>
                                                {item.displayOldValue}
                                            </div>
                                            <Icon
                                                icon="lucide:arrow-right"
                                                className="text-hub-subtitle shrink-0 text-xs"
                                            />
                                            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded px-2 py-1 font-mono text-[11px] truncate">
                                                <span className="font-semibold select-none mr-1">
                                                    [+]
                                                </span>
                                                {item.displayNewValue}
                                            </div>
                                        </CustomFlex>
                                    </CustomFlex>
                                ))}
                            </>
                        )}

                        {codeDiffItems.length > 0 && (
                            <CustomFlex vertical gap="small" className="pt-2">
                                <CustomTypography.Text
                                    strong
                                    className="text-xs uppercase tracking-wider text-hub-subtitle"
                                >
                                    Chi tiết thay đổi mã nguồn ({codeDiffItems.length})
                                </CustomTypography.Text>
                                {codeDiffItems.map((item) => (
                                    <CodeDisplay
                                        maxHeight="220px"
                                        key={item.key}
                                        title={item.label}
                                        code={String(item.newValue || '')}
                                        compareCode={String(item.oldValue || '')}
                                        language={item.codeLanguage || 'javascript'}
                                    />
                                ))}
                            </CustomFlex>
                        )}
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
