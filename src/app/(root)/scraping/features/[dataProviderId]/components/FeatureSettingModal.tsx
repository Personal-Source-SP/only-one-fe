'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomModal,
    CustomPopconfirm,
    CustomSelect,
    CustomSpace,
    CustomTabs,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { API_ENDPOINT } from '@/config';
import { ConfigVersionType, MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { getFeatureDefinition } from '../utils';
import type { FeatureModalTab, IConfigVersion, IDataProviderFeature } from '../types';
import { FeatureTestTab } from './FeatureTestTab';

type FeatureSettingModalProps = {
    open: boolean;
    activeTab: FeatureModalTab;
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
    onTabChange: (tab: FeatureModalTab) => void;
};

export const FeatureSettingModal = ({
    open,
    activeTab,
    feature,
    onClose,
    onSuccess,
    onTabChange,
}: FeatureSettingModalProps) => {
    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();

    const isDraft = !feature.id;
    const providerName = feature.dataProvider?.name;

    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def?.ConfigComponent;

    // Fetch version history for existing feature
    const { result: versionsResult, query: versionsQuery } = useCustomData({
        url: API_ENDPOINT.DATA_PROVIDER_FEATURES.VERSIONS(feature.id),
        enabled: Boolean(open && feature.id),
    });

    const versions = useMemo(
        () => (versionsResult?.data?.data || []) as IConfigVersion[],
        [versionsResult],
    );

    const activeVersion = useMemo(() => versions.find((v) => v.isActive), [versions]);
    const { handleCustomMutationData } = useCustomMutationData();

    // Reset or set selected version whenever activeVersion loads or modal opens
    useEffect(() => {
        if (open && activeVersion) {
            setSelectedVersionId(activeVersion.versionId);
        } else if (!open) {
            setSelectedVersionId(undefined);
            form.resetFields();
        }
    }, [open, activeVersion, form]);

    const selectedVersion = useMemo(
        () => versions.find((v) => v.versionId === selectedVersionId) || activeVersion || null,
        [versions, selectedVersionId, activeVersion],
    );

    const isViewingHistory = Boolean(selectedVersion && !selectedVersion.isActive);

    const handleRollback = (targetVersionId?: number) => {
        const vId = targetVersionId || selectedVersion?.versionId;
        if (!feature.id || !vId) return;

        setIsRollingBack(true);
        handleCustomMutationData({
            method: 'post',
            url: API_ENDPOINT.DATA_PROVIDER_FEATURES.ROLLBACK(feature.id, vId),
            successNotification: () => {
                setIsRollingBack(false);
                versionsQuery.refetch();
                onSuccess();
                return {
                    type: MessageType.SUCCESS,
                    message: `Đã khôi phục về phiên bản v${vId}`,
                };
            },
            errorNotification: (error) => {
                setIsRollingBack(false);
                return {
                    type: MessageType.ERROR,
                    message: 'Khôi phục phiên bản thất bại',
                    description: error?.message,
                };
            },
        });
    };

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

    const renderChangeTypeTag = (changeType?: ConfigVersionType) => {
        if (!changeType) return null;
        let label = 'Chỉnh sửa thủ công';
        let icon = 'lucide:edit-3';
        if (changeType === ConfigVersionType.AI_GENERATED) {
            label = 'AI tạo';
            icon = 'lucide:sparkles';
        } else if (changeType === ConfigVersionType.ROLLBACK) {
            label = 'Khôi phục';
            icon = 'lucide:history';
        }

        return (
            <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                <Icon icon={icon} className="w-3 h-3" />
                {label}
            </CustomTag>
        );
    };

    const authorName = useMemo(() => {
        if (!selectedVersion) return null;
        if (selectedVersion.user) {
            const fullName = `${selectedVersion.user.firstName || ''} ${
                selectedVersion.user.lastName || ''
            }`.trim();
            return fullName || selectedVersion.user.email || selectedVersion.user.userName;
        }
        return selectedVersion.createdBy || null;
    }, [selectedVersion]);

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:settings" className="w-4 h-4" />
                    Cấu hình
                </span>
            ),
            children: ConfigComponent ? (
                <ConfigComponent
                    form={form}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    setIsSaving={setIsSaving}
                    onClose={onClose}
                    onSuccess={onSuccess}
                />
            ) : (
                <div className="p-6 text-center text-hub-subtitle">
                    Chưa có biểu mẫu cấu hình cho tính năng này.
                </div>
            ),
        },
        ...(!isDraft
            ? [
                  {
                      key: 'test',
                      label: (
                          <span className="flex items-center gap-2">
                              <Icon icon="lucide:flask-conical" className="w-4 h-4" />
                              Thử nghiệm
                          </span>
                      ),
                      children: <FeatureTestTab feature={feature} />,
                  },
              ]
            : []),
    ];

    const modalTitle = (
        <CustomFlex justify="space-between" align="center" className="w-full pr-6 flex-wrap gap-2">
            <CustomFlex align="center" gap="middle">
                <CustomFlex
                    align="center"
                    justify="center"
                    className={`p-2 rounded-xl shrink-0 ${
                        def?.accentClass || 'text-hub-primary bg-hub-primary/10'
                    }`}
                >
                    <Icon icon={def?.icon || 'lucide:sliders'} className="text-lg" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Text strong className="text-base text-hub-title">
                            {def?.getTitle
                                ? def.getTitle(isDraft, providerName)
                                : `${isDraft ? 'Thiết lập' : 'Cấu hình'}: ${feature.type}`}
                        </CustomTypography.Text>
                        {feature.service && (
                            <CustomTag className="font-mono text-xs m-0">
                                {feature.service}
                            </CustomTag>
                        )}
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>

            {/* Version Metadata Tags in Header (Inspired by Orien-Trade) */}
            {!isDraft && selectedVersion && (
                <CustomFlex align="center" gap="small" wrap>
                    {authorName && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                            <Icon icon="lucide:user" className="w-3 h-3" />
                            {authorName}
                        </CustomTag>
                    )}
                    {renderChangeTypeTag(selectedVersion.changeType)}
                    {selectedVersion.createdAt && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                            <Icon icon="lucide:clock" className="w-3 h-3" />
                            {formatDate(selectedVersion.createdAt)}
                        </CustomTag>
                    )}
                    {selectedVersion.isActive ? (
                        <CustomTag color="success" className="font-mono font-bold m-0">
                            v{selectedVersion.versionId} Active
                        </CustomTag>
                    ) : (
                        <CustomTag color="warning" className="font-mono font-bold m-0">
                            v{selectedVersion.versionId} (Lịch sử)
                        </CustomTag>
                    )}
                </CustomFlex>
            )}
        </CustomFlex>
    );

    const renderFooter = () => {
        switch (activeTab) {
            case 'config':
                return (
                    <CustomFlex
                        justify="space-between"
                        align="center"
                        className="w-full flex-wrap gap-2"
                    >
                        <CustomFlex align="center" gap="small">
                            {!isDraft && !!versions.length && (
                                <CustomSelect
                                    className="w-64"
                                    value={selectedVersion?.versionId}
                                    options={versionOptions}
                                    disabled={versionOptions.length <= 1}
                                    onChange={(value) => setSelectedVersionId(value)}
                                    dropdownStyle={{ width: 280 }}
                                />
                            )}
                        </CustomFlex>
                        <CustomFlex align="center" gap="small">
                            {!isDraft && !!versions.length && (
                                <CustomPopconfirm
                                    okText="Khôi phục"
                                    cancelText="Hủy"
                                    title={`Khôi phục phiên bản v${selectedVersion?.versionId}?`}
                                    description="Cấu hình hiện tại của tính năng sẽ được thay thế bằng snapshot này."
                                    onConfirm={() => handleRollback(selectedVersion?.versionId)}
                                >
                                    <CustomButton
                                        disabled={!isViewingHistory}
                                        type="primary"
                                        icon={<Icon icon="lucide:rotate-ccw" />}
                                        loading={isRollingBack}
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
                                disabled={isViewingHistory}
                                loading={isSaving}
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
            case 'test':
            default:
                return (
                    <CustomFlex justify="end" gap="small">
                        <CustomButton onClick={onClose}>Đóng</CustomButton>
                    </CustomFlex>
                );
        }
    };

    return (
        <CustomModal
            open={open}
            width={1000}
            footer={renderFooter()}
            onCancel={onClose}
            title={modalTitle}
        >
            <CustomTabs
                items={tabItems}
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FeatureModalTab)}
            />
        </CustomModal>
    );
};
