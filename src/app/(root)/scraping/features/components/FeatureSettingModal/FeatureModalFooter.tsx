'use client';

import { useMemo } from 'react';
import {
    CustomButton,
    CustomFlex,
    CustomPopconfirm,
    CustomSelect,
    CustomSpace,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { ConfigVersionType } from '../../enums';
import type { IConfigVersion } from '../../types';

export interface FeatureModalFooterProps {
    isDraft: boolean;
    isSaving: boolean;
    form: FormInstance;
    isRollingBack: boolean;
    isViewingHistory: boolean;
    versions: IConfigVersion[];
    selectedVersion: IConfigVersion | null;
    onClose: () => void;
    onRollback: (versionId?: number) => void;
    onSelectVersion: (versionId: number) => void;
}

export const FeatureModalFooter = ({
    isDraft,
    isSaving,
    form,
    isRollingBack,
    isViewingHistory,
    versions,
    selectedVersion,
    onClose,
    onRollback,
    onSelectVersion,
}: FeatureModalFooterProps) => {
    const versionOptions = useMemo(() => {
        if (!versions.length) return [];

        return [...versions]
            .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return b.versionId - a.versionId;
            })
            .map((v) => {
                let changeLabel = 'Thủ công';
                if (v.changeType === ConfigVersionType.AI_GENERATED) changeLabel = 'AI tạo';
                if (v.changeType === ConfigVersionType.ROLLBACK) changeLabel = 'Khôi phục';

                const text = v.isActive
                    ? 'Current Version'
                    : `Version ${v.versionId} - ${changeLabel}`;

                return {
                    value: v.versionId,
                    label: (
                        <CustomSpace size={6} className="w-full">
                            <Icon
                                icon="lucide:clock"
                                className="w-3.5 h-3.5 text-hub-subtitle shrink-0"
                            />
                            <span
                                className={
                                    v.isActive
                                        ? 'font-bold text-hub-primary'
                                        : 'font-medium text-hub-title'
                                }
                            >
                                {text}
                            </span>
                        </CustomSpace>
                    ),
                };
            });
    }, [versions]);

    return (
        <CustomFlex justify="space-between" align="center" className="w-full flex-wrap gap-2">
            <CustomFlex align="center" gap="small">
                {!isDraft && !!versions.length && (
                    <CustomSelect
                        className="w-64"
                        options={versionOptions}
                        disabled={versionOptions.length <= 1}
                        value={selectedVersion?.versionId}
                        dropdownStyle={{ width: 280 }}
                        onChange={onSelectVersion}
                    />
                )}
            </CustomFlex>
            <CustomFlex align="center" gap="small" className="ml-auto">
                {!isDraft && !!versions.length && (
                    <CustomPopconfirm
                        cancelText="Hủy"
                        okText="Khôi phục"
                        onConfirm={() => onRollback(selectedVersion?.versionId)}
                        title={`Khôi phục phiên bản v${selectedVersion?.versionId}?`}
                        description="Cấu hình hiện tại của tính năng sẽ được thay thế bằng snapshot này."
                    >
                        <CustomButton
                            type="primary"
                            loading={isRollingBack}
                            disabled={!isViewingHistory}
                            icon={<Icon icon="lucide:rotate-ccw" />}
                            className={
                                isViewingHistory
                                    ? 'bg-amber-600 hover:bg-amber-500 border-amber-600 text-white'
                                    : undefined
                            }
                        >
                            Khôi phục
                        </CustomButton>
                    </CustomPopconfirm>
                )}
                <CustomButton
                    type="primary"
                    loading={isSaving}
                    disabled={isViewingHistory}
                    onClick={() => form.submit()}
                    icon={<Icon icon="lucide:save" />}
                >
                    Lưu cấu hình
                </CustomButton>
                <CustomButton onClick={onClose} disabled={isSaving || isRollingBack}>
                    Hủy
                </CustomButton>
            </CustomFlex>
        </CustomFlex>
    );
};
