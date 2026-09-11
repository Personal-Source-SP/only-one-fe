'use client';

import { CustomFlex, CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useMessage } from '@/hooks';
import { Icon } from '@iconify/react';
import { useCallback, useMemo, useState } from 'react';
import { DataProviderFeatureStatus } from '../../enums';
import { useFeatureModalController } from '../../hooks';
import type { IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';
import { FeatureConfirmUpdateModal } from '../FeatureConfirmUpdateModal';
import { FeatureTestTab } from '../FeatureTestTab';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

export type FeatureSettingModalProps = {
    open: boolean;
    feature: IDataProviderFeature;
    isSwitchingStatus?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
};

export const FeatureSettingModal = ({
    open,
    feature,
    isSwitchingStatus = false,
    onClose,
    onSuccess,
    onSwitchStatus,
}: FeatureSettingModalProps) => {
    const [form] = CustomForm.useForm();
    const { handleNotification } = useMessage();
    const [activeTabKey, setActiveTabKey] = useState<'config' | 'test'>('config');

    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def.ConfigComponent;

    const {
        isDraft,
        versions,
        selectedVersion,
        isViewingHistory,
        isRollingBack,
        isSaving,
        isConfirmOpen,
        diffItems,
        authorName,
        isGlobalLoading,
        loadingTip,
        setSelectedVersionId,
        handleRollback,
        handleFormSubmit,
        handleConfirmUpdate,
        handleCancelConfirm,
    } = useFeatureModalController({
        open,
        feature,
        form,
        isSwitchingStatus,
        onClose,
        onSuccess,
    });

    const tabItems = useMemo(
        () => [
            {
                key: 'config',
                label: (
                    <CustomFlex align="center" gap={6}>
                        <Icon icon="lucide:settings-2" className="text-base" />
                        <span className="font-medium">Cấu hình tính năng</span>
                    </CustomFlex>
                ),
                children: (
                    <div className="h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar py-1 pr-1">
                        <ConfigComponent
                            feature={feature}
                            form={form}
                            selectedVersion={selectedVersion}
                            isViewingHistory={isViewingHistory}
                            onClose={onClose}
                            onSuccess={onSuccess}
                            onSaveForm={handleFormSubmit}
                        />
                    </div>
                ),
            },
            {
                key: 'test',
                label: (
                    <CustomFlex align="center" gap={6}>
                        <Icon icon="lucide:flask-conical" className="text-base" />
                        <span className="font-medium">Thử nghiệm Sandbox</span>
                    </CustomFlex>
                ),
                children: (
                    <div className="h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-200px)] overflow-y-auto custom-scrollbar py-1 pr-1">
                        <FeatureTestTab feature={feature} configForm={form} />
                    </div>
                ),
            },
        ],
        [
            ConfigComponent,
            feature,
            form,
            selectedVersion,
            isViewingHistory,
            onClose,
            onSuccess,
            handleFormSubmit,
        ],
    );

    const handleTabChange = useCallback(
        async (nextKey: string) => {
            if (nextKey === 'test') {
                try {
                    await form.validateFields();
                    setActiveTabKey('test');
                } catch {
                    handleNotification({
                        type: MessageType.WARNING,
                        title: 'Cấu hình chưa hoàn tất',
                        description:
                            'Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc trước khi kiểm thử.',
                    });
                }
            } else {
                setActiveTabKey(nextKey as 'config' | 'test');
            }
        },
        [form, handleNotification],
    );

    return (
        <CustomModal
            open={open}
            width={1300}
            onCancel={onClose}
            loadingTip={loadingTip}
            loading={isGlobalLoading}
            bodyClassName="!p-2.5 sm:!p-3"
            className="top-6 max-w-[96vw]"
            title={
                <FeatureModalHeader
                    form={form}
                    feature={feature}
                    isDraft={isDraft}
                    authorName={authorName}
                    selectedVersion={selectedVersion}
                    isSwitchingStatus={isSwitchingStatus}
                    onSwitchStatus={() => onSwitchStatus(feature.id, feature.status)}
                />
            }
            footer={
                <FeatureModalFooter
                    form={form}
                    isDraft={isDraft}
                    versions={versions}
                    isRollingBack={isRollingBack}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onClose={onClose}
                    onRollback={handleRollback}
                    onSelectVersion={setSelectedVersionId}
                />
            }
        >
            <CustomTabs activeKey={activeTabKey} onChange={handleTabChange} items={tabItems} />
            <FeatureConfirmUpdateModal
                open={isConfirmOpen}
                isSaving={isSaving}
                diffItems={diffItems}
                onClose={handleCancelConfirm}
                onConfirm={handleConfirmUpdate}
            />
        </CustomModal>
    );
};
