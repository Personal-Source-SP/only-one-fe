'use client';

import { useState, type FC, type JSX } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomModal,
    CustomPopconfirm,
    CustomTable,
    type ColumnsType,
} from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import type {
    IConfigVersion,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';

interface FeatureVersionHistoryTabProps {
    feature: IDataProviderFeature;
    onRollbackSuccess?: () => void;
}

export const FeatureVersionHistoryTab: FC<FeatureVersionHistoryTabProps> = ({
    feature,
    onRollbackSuccess,
}): JSX.Element => {
    const [previewVersion, setPreviewVersion] = useState<IConfigVersion | null>(null);
    const { handleCustomMutationData } = useCustomMutationData();

    // Query config versions for this feature
    const { result, query } = useCustomData({
        url: `data-provider-features/${feature.id}/versions`,
        enabled: Boolean(feature.id),
    });

    const versions = (result?.data?.data || []) as IConfigVersion[];

    const handleRollback = (versionId: number) => {
        handleCustomMutationData({
            method: 'post',
            url: `data-provider-features/${feature.id}/versions/${versionId}/rollback`,
            successNotification: () => {
                query.refetch();
                onRollbackSuccess?.();
                return {
                    type: MessageType.SUCCESS,
                    message: `Đã khôi phục về phiên bản v${versionId}`,
                };
            },
            errorNotification: (error) => ({
                type: MessageType.ERROR,
                message: 'Khôi phục phiên bản thất bại',
                description: error?.message,
            }),
        });
    };

    const handleDelete = (versionId: number) => {
        handleCustomMutationData({
            method: 'delete',
            url: `data-provider-features/${feature.id}/versions/${versionId}`,
            successNotification: () => {
                query.refetch();
                return {
                    type: MessageType.SUCCESS,
                    message: `Đã xóa phiên bản v${versionId}`,
                };
            },
            errorNotification: (error) => ({
                type: MessageType.ERROR,
                message: 'Xóa phiên bản thất bại',
                description: error?.message,
            }),
        });
    };

    const columns: ColumnsType<IConfigVersion> = [
        {
            title: 'Phiên bản',
            dataIndex: 'versionId',
            key: 'versionId',
            width: '15%',
            render: (vId: number, record) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-hub-title">{`v${vId || record.versionId}`}</span>
                    {record.isActive && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Active
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
            width: '12%',
            render: (service: string) => (
                <span className="text-xs px-2 py-0.5 rounded bg-hub-section border border-hub-border text-hub-subtitle font-mono">
                    {service || feature.service || 'generic'}
                </span>
            ),
        },
        {
            title: 'Mô tả thay đổi',
            dataIndex: 'changeDescription',
            key: 'changeDescription',
            ellipsis: true,
            width: '35%',
            render: (desc: string) => (
                <span className="text-xs text-hub-title">{desc || 'Cập nhật cấu hình'}</span>
            ),
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: '20%',
            render: (createdAt: Date) => (
                <span className="text-xs text-hub-subtitle">
                    {createdAt ? formatDate(createdAt) : '-'}
                </span>
            ),
        },
        {
            title: 'Tác vụ',
            key: 'actions',
            align: 'right',
            width: '18%',
            render: (_, record) => (
                <div className="flex items-center justify-end gap-1.5">
                    <CustomButton
                        type="text"
                        size="small"
                        icon={<Icon icon="lucide:eye" className="w-4 h-4" />}
                        title="Xem chi tiết snapshot"
                        onClick={() => setPreviewVersion(record)}
                    />

                    {!record.isActive && (
                        <CustomPopconfirm
                            title={`Khôi phục phiên bản v${record.versionId}?`}
                            description="Cấu hình hiện tại sẽ được thay thế bằng snapshot này."
                            onConfirm={() => handleRollback(record.versionId)}
                            okText="Khôi phục"
                            cancelText="Hủy"
                        >
                            <CustomButton
                                type="text"
                                size="small"
                                icon={
                                    <Icon
                                        icon="lucide:rotate-ccw"
                                        className="w-4 h-4 text-amber-500"
                                    />
                                }
                                title="Khôi phục (Rollback)"
                            />
                        </CustomPopconfirm>
                    )}

                    {!record.isActive && (
                        <CustomPopconfirm
                            title={`Xóa phiên bản v${record.versionId}?`}
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleDelete(record.versionId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <CustomButton
                                type="text"
                                size="small"
                                danger
                                icon={
                                    <Icon icon="lucide:trash-2" className="w-4 h-4 text-rose-500" />
                                }
                                title="Xóa phiên bản"
                            />
                        </CustomPopconfirm>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-1 flex items-center gap-2">
                    <Icon icon="lucide:history" className="text-hub-primary" />
                    <span>Lịch sử các phiên bản cấu hình</span>
                </h4>
                <p className="text-xs text-hub-subtitle">
                    Theo dõi toàn bộ lịch sử thay đổi cấu hình, hỗ trợ xem snapshot, rollback và dọn
                    dẹp các phiên bản không hoạt động.
                </p>
            </div>

            <CustomTable
                tableProps={{
                    dataSource: versions,
                    pagination: { pageSize: 5 },
                    rowKey: 'id',
                }}
                columns={columns}
                loading={query.isLoading}
            />

            {/* Preview snapshot modal */}
            {previewVersion && (
                <CustomModal
                    open={Boolean(previewVersion)}
                    onCancel={() => setPreviewVersion(null)}
                    footer={null}
                    width={700}
                    title={
                        <div className="flex items-center gap-2 text-base font-semibold">
                            <Icon icon="lucide:file-code" className="text-hub-primary text-xl" />
                            <span>{`Chi tiết snapshot cấu hình: v${previewVersion.versionId}`}</span>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <div className="text-xs text-hub-subtitle flex items-center justify-between border-b border-hub-border/40 pb-2">
                            <span>
                                Service:{' '}
                                <strong>
                                    {previewVersion.service || feature.service || 'generic'}
                                </strong>
                            </span>
                            <span>
                                Ngày tạo:{' '}
                                <strong>
                                    {previewVersion.createdAt
                                        ? formatDate(previewVersion.createdAt)
                                        : '-'}
                                </strong>
                            </span>
                        </div>
                        <CodeDisplay
                            language="json"
                            code={JSON.stringify(previewVersion.config, null, 2)}
                        />
                    </div>
                </CustomModal>
            )}
        </div>
    );
};
