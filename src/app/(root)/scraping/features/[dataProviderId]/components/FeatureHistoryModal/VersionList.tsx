'use client';

import { useCallback } from 'react';
import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { ConfigVersionType } from '@/enums';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import type { IConfigVersion } from '../../types';

export type VersionListProps = {
    sortedVersions: IConfigVersion[];
    currentSelectedVersion: IConfigVersion | null;
    onSelectVersion: (versionId: number) => void;
};

export const VersionList = ({
    sortedVersions,
    currentSelectedVersion,
    onSelectVersion,
}: VersionListProps) => {
    const renderChangeTypeTag = useCallback((type: ConfigVersionType) => {
        switch (type) {
            case ConfigVersionType.AI_GENERATED:
                return (
                    <CustomTag color="purple" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:sparkles" className="w-3 h-3" />
                        AI tạo
                    </CustomTag>
                );
            case ConfigVersionType.ROLLBACK:
                return (
                    <CustomTag color="orange" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:history" className="w-3 h-3" />
                        Khôi phục
                    </CustomTag>
                );
            case ConfigVersionType.MANUAL_EDIT:
            default:
                return (
                    <CustomTag color="blue" className="flex items-center gap-1 m-0">
                        <Icon icon="lucide:edit-3" className="w-3 h-3" />
                        Thủ công
                    </CustomTag>
                );
        }
    }, []);

    return (
        <CustomFlex
            vertical
            gap="small"
            className="w-[360px] shrink-0 border-r border-gray-100 dark:border-gray-800 pr-3 overflow-y-auto max-h-[520px]"
        >
            <CustomTypography.Text
                strong
                className="text-xs text-hub-subtitle uppercase tracking-wider mb-1"
            >
                Danh sách phiên bản ({sortedVersions.length})
            </CustomTypography.Text>
            {sortedVersions.map((v) => {
                const isSelected = currentSelectedVersion?.versionId === v.versionId;
                const authorName = v.user
                    ? `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() || v.user.email
                    : v.createdBy || 'Hệ thống';

                return (
                    <div
                        key={v.id || v.versionId}
                        onClick={() => onSelectVersion(v.versionId)}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                            isSelected
                                ? 'border-hub-primary bg-hub-primary/5 shadow-xs'
                                : 'border-gray-200/70 dark:border-gray-800 hover:border-hub-primary/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                        }`}
                    >
                        <CustomFlex justify="space-between" align="center" className="mb-1.5">
                            <CustomFlex align="center" gap="small">
                                <span className="font-bold text-sm font-mono text-hub-title">
                                    v{v.versionId}
                                </span>
                                {v.isActive && (
                                    <CustomTag color="success" className="m-0 font-medium text-xs">
                                        Đang dùng
                                    </CustomTag>
                                )}
                            </CustomFlex>
                            {renderChangeTypeTag(v.changeType)}
                        </CustomFlex>

                        <CustomTypography.Paragraph
                            ellipsis={{ rows: 2 }}
                            className="!mb-2 text-xs text-hub-title"
                        >
                            {v.changeDescription || 'Chỉnh sửa cấu hình'}
                        </CustomTypography.Paragraph>

                        <CustomFlex
                            justify="space-between"
                            align="center"
                            className="text-xs text-hub-subtitle"
                        >
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                                <Icon icon="lucide:user" className="w-3 h-3 shrink-0" />
                                <span className="truncate">{authorName}</span>
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                                <Icon icon="lucide:clock" className="w-3 h-3" />
                                {formatDate(v.createdAt)}
                            </span>
                        </CustomFlex>
                    </div>
                );
            })}
        </CustomFlex>
    );
};
