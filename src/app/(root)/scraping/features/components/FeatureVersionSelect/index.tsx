'use client';

import {
    CustomDropdown,
    CustomFlex,
    CustomTag,
    type MenuProps,
    useCustomApp,
} from '@/components/custom-antd';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useCallback, useMemo } from 'react';
import { useFeatureModalContext } from '../../context';
import { ConfigVersionType } from '../../enums';
import type { IConfigVersion } from '../../types';
import { FeatureVersionTrigger } from './FeatureVersionTrigger';

export type FeatureVersionSelectProps = {
    disabled?: boolean;
    className?: string;
};

export const FeatureVersionSelect = ({
    disabled = false,
    className = '',
}: FeatureVersionSelectProps) => {
    const { modal } = useCustomApp();
    const { isDraft, versions, selectedVersion, isLoading, onRollback } = useFeatureModalContext();

    const { activeVersion, historyVersions, hasMultiple } = useMemo(() => {
        const active = versions.find((v) => v.isActive);
        const history = versions
            .filter((v) => !v.isActive)
            .sort((a, b) => b.versionId - a.versionId);

        return {
            activeVersion: active,
            historyVersions: history,
            hasMultiple: versions.length > 1,
        };
    }, [versions]);

    const isDisabled = useMemo(
        () => disabled || isLoading || !hasMultiple,
        [disabled, isLoading, hasMultiple],
    );

    const handleConfirmRollback = useCallback(
        (targetVersion: IConfigVersion) => {
            modal.confirm({
                cancelText: 'Hủy',
                okText: 'Khôi phục',
                title: `Khôi phục về phiên bản v${targetVersion.versionId}?`,
                icon: <Icon icon="lucide:rotate-ccw" className="text-amber-500 text-xl mr-2" />,
                content:
                    'Cấu hình hiện tại của tính năng sẽ được thay thế hoàn toàn bằng phiên bản snapshot này.',
                okButtonProps: {
                    type: 'primary',
                    className: '!bg-amber-600 hover:!bg-amber-500 !border-amber-600',
                },
                onOk: async () => {
                    await onRollback(targetVersion.versionId);
                },
            });
        },
        [modal, onRollback],
    );

    const renderChangeTypeTag = useCallback((type?: ConfigVersionType) => {
        let label = 'Thủ công';
        let color = 'blue';
        let icon = 'lucide:edit-3';

        if (type === ConfigVersionType.AI_GENERATED) {
            label = 'AI tạo';
            color = 'purple';
            icon = 'lucide:sparkles';
        } else if (type === ConfigVersionType.ROLLBACK) {
            label = 'Khôi phục';
            color = 'orange';
            icon = 'lucide:history';
        }

        return (
            <CustomTag
                color={color}
                className="flex items-center gap-1 m-0 text-[10px] px-1.5 py-0"
            >
                <Icon icon={icon} className="w-3 h-3" />
                {label}
            </CustomTag>
        );
    }, []);

    const getAuthor = useCallback((v: IConfigVersion) => {
        if (v.user) {
            const name = `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim();
            return name || v.user.email || v.user.userName;
        }
        return v.createdBy || 'Hệ thống';
    }, []);

    const menuItems: MenuProps['items'] = useMemo(() => {
        const items: MenuProps['items'] = [];

        if (activeVersion) {
            items.push({
                type: 'group',
                key: 'header-current-version',
                label: (
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        Phiên bản đang áp dụng
                    </span>
                ),
                children: [
                    {
                        disabled: true,
                        key: `active-${activeVersion.versionId}`,
                        className:
                            '!cursor-default !bg-slate-50 dark:!bg-slate-900/60 !rounded-lg !my-1',
                        label: (
                            <CustomFlex
                                justify="space-between"
                                align="center"
                                className="py-1.5 min-w-[300px]"
                            >
                                <CustomFlex vertical gap={4}>
                                    <CustomFlex align="center" gap={8}>
                                        <span className="font-bold text-xs text-hub-title font-mono">
                                            v{activeVersion.versionId}
                                        </span>
                                        {renderChangeTypeTag(activeVersion.changeType)}
                                    </CustomFlex>
                                    <span className="text-[11px] text-hub-subtitle">
                                        {formatDate(activeVersion.createdAt)} •{' '}
                                        {getAuthor(activeVersion)}
                                    </span>
                                </CustomFlex>
                                <CustomTag
                                    color="success"
                                    className="text-[10px] m-0 px-1.5 py-0 font-medium"
                                >
                                    Đang áp dụng
                                </CustomTag>
                            </CustomFlex>
                        ),
                    },
                ],
            });
        }

        if (historyVersions.length > 0) {
            items.push(
                { type: 'divider' },
                {
                    type: 'group',
                    key: 'header-history-versions',
                    label: (
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                            Lịch sử phiên bản (Click để khôi phục)
                        </span>
                    ),
                    children: historyVersions.map((v) => ({
                        key: `history-${v.versionId}`,
                        onClick: () => handleConfirmRollback(v),
                        className:
                            '!rounded-lg !my-0.5 hover:!bg-slate-100 dark:hover:!bg-slate-800/80 transition-colors',
                        label: (
                            <CustomFlex
                                align="center"
                                justify="space-between"
                                className="py-1.5 min-w-[300px]"
                            >
                                <CustomFlex vertical gap={4}>
                                    <CustomFlex align="center" gap={8}>
                                        <span className="font-semibold text-xs text-hub-title font-mono">
                                            v{v.versionId}
                                        </span>
                                        {renderChangeTypeTag(v.changeType)}
                                    </CustomFlex>
                                    <span className="text-[11px] text-hub-subtitle">
                                        {formatDate(v.createdAt)} • {getAuthor(v)}
                                    </span>
                                </CustomFlex>
                                <CustomTag
                                    color="warning"
                                    className="text-[10px] m-0 px-1.5 py-0 font-medium flex items-center gap-1"
                                >
                                    <Icon icon="lucide:rotate-ccw" className="w-3 h-3" />
                                    Khôi phục
                                </CustomTag>
                            </CustomFlex>
                        ),
                    })),
                },
            );
        }

        return items;
    }, [activeVersion, historyVersions, renderChangeTypeTag, getAuthor, handleConfirmRollback]);

    if (isDraft || !versions.length) return null;

    return (
        <CustomDropdown
            trigger={['click']}
            disabled={isDisabled}
            placement="bottomLeft"
            menu={{ items: menuItems }}
        >
            <FeatureVersionTrigger
                loading={isLoading}
                disabled={isDisabled}
                className={className}
                hasMultipleVersions={hasMultiple}
                version={activeVersion || selectedVersion}
            />
        </CustomDropdown>
    );
};
