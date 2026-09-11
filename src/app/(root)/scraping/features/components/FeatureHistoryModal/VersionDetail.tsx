'use client';

import {
    CustomButton,
    CustomFlex,
    CustomPopconfirm,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureHistoryContext } from '../../context';

export const VersionDetail = () => {
    const { currentSelectedVersion, isApplying, handleApply, handleCopyConfig } =
        useFeatureHistoryContext();

    if (!currentSelectedVersion) return null;

    return (
        <CustomFlex vertical className="flex-1 pl-2 max-h-[520px] overflow-y-auto" gap="middle">
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
                            <CustomTag color="success" className="font-medium m-0">
                                Đang áp dụng trên hệ thống
                            </CustomTag>
                        ) : (
                            <CustomTag color="default" className="font-medium m-0">
                                Snapshot lịch sử
                            </CustomTag>
                        )}
                    </CustomFlex>
                    <CustomTypography.Text type="secondary" className="text-xs">
                        Mô tả:{' '}
                        {currentSelectedVersion.changeDescription || 'Không có mô tả chi tiết'}
                    </CustomTypography.Text>
                </CustomFlex>

                <CustomFlex align="center" gap="small">
                    <CustomButton icon={<Icon icon="lucide:copy" />} onClick={handleCopyConfig}>
                        Copy JSON
                    </CustomButton>
                    {!currentSelectedVersion.isActive && (
                        <CustomPopconfirm
                            cancelText="Hủy"
                            okText="Xác nhận áp dụng"
                            onConfirm={() => handleApply(currentSelectedVersion.versionId)}
                            description="Cấu hình hiện tại sẽ được cập nhật và tạo snapshot mới."
                            title={`Áp dụng cấu hình phiên bản v${currentSelectedVersion.versionId}?`}
                        >
                            <CustomButton
                                type="primary"
                                loading={isApplying}
                                className="bg-hub-primary"
                                icon={<Icon icon="lucide:rotate-ccw" />}
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
                    {JSON.stringify(currentSelectedVersion.config || {}, null, 2)}
                </pre>
            </div>
        </CustomFlex>
    );
};
