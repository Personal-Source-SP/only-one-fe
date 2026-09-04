'use client';

import { useMemo, useState } from 'react';
import { CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureVersionManager } from '../../hooks/useFeatureVersionManager';
import type { FeatureModalTab, IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';
import { FeatureTestTab } from '../FeatureTestTab';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

export type FeatureSettingModalProps = {
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

    const isDraft = !feature.id;
    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def?.ConfigComponent;

    const {
        versions,
        selectedVersion,
        isViewingHistory,
        isRollingBack,
        authorName,
        setSelectedVersionId,
        handleRollback,
    } = useFeatureVersionManager({
        open,
        feature,
        form,
        onSuccess,
    });

    const tabItems = useMemo(() => {
        const items = [
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
                        feature={feature}
                        form={form}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                        onClose={onClose}
                        onSuccess={onSuccess}
                        setIsSaving={setIsSaving}
                    />
                ) : (
                    <div className="p-6 text-center text-hub-subtitle">
                        Chưa có biểu mẫu cấu hình cho tính năng này.
                    </div>
                ),
            },
        ];

        if (!isDraft) {
            items.push({
                key: 'test',
                label: (
                    <span className="flex items-center gap-2">
                        <Icon icon="lucide:flask-conical" className="w-4 h-4" />
                        Thử nghiệm
                    </span>
                ),
                children: <FeatureTestTab feature={feature} />,
            });
        }

        return items;
    }, [
        ConfigComponent,
        feature,
        form,
        selectedVersion,
        isViewingHistory,
        isDraft,
        onClose,
        onSuccess,
    ]);

    return (
        <CustomModal
            open={open}
            width={1000}
            onCancel={onClose}
            footer={
                <FeatureModalFooter
                    form={form}
                    isDraft={isDraft}
                    onClose={onClose}
                    versions={versions}
                    isSaving={isSaving}
                    activeTab={activeTab}
                    isRollingBack={isRollingBack}
                    onRollback={handleRollback}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onSelectVersion={setSelectedVersionId}
                />
            }
            title={
                <FeatureModalHeader
                    feature={feature}
                    isDraft={isDraft}
                    authorName={authorName}
                    selectedVersion={selectedVersion}
                />
            }
        >
            <CustomTabs
                items={tabItems}
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FeatureModalTab)}
            />
        </CustomModal>
    );
};
