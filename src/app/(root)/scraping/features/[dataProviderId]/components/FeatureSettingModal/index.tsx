'use client';

import { useState } from 'react';
import { CustomCol, CustomForm, CustomModal, CustomRow } from '@/components/custom-antd';
import { useFeatureVersionManager } from '../../hooks/useFeatureVersionManager';
import type { FeatureModalTab, IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';
import { FeatureTestTab } from '../FeatureTestTab';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

export type FeatureSettingModalProps = {
    open: boolean;
    activeTab?: FeatureModalTab;
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
    onTabChange?: (tab: FeatureModalTab) => void;
};

export const FeatureSettingModal = ({
    open,
    feature,
    onClose,
    onSuccess,
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

    return (
        <CustomModal
            open={open}
            width={1300}
            className="top-6 max-w-[96vw]"
            onCancel={onClose}
            footer={
                <FeatureModalFooter
                    form={form}
                    isDraft={isDraft}
                    versions={versions}
                    isSaving={isSaving}
                    isRollingBack={isRollingBack}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onClose={onClose}
                    onRollback={handleRollback}
                    onSelectVersion={setSelectedVersionId}
                />
            }
            title={
                <FeatureModalHeader
                    form={form}
                    feature={feature}
                    isDraft={isDraft}
                    authorName={authorName}
                    selectedVersion={selectedVersion}
                />
            }
        >
            <CustomRow gutter={[24, 24]}>
                <CustomCol xs={24} lg={13} xl={14}>
                    <div className="max-h-[calc(85vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
                        {ConfigComponent ? (
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
                        )}
                    </div>
                </CustomCol>
                <CustomCol xs={24} lg={11} xl={10}>
                    <div className="max-h-[calc(85vh-160px)] overflow-y-auto pl-1 custom-scrollbar border-t lg:border-t-0 lg:border-l border-hub-border/60 pt-4 lg:pt-0 lg:pl-5">
                        <FeatureTestTab feature={feature} configForm={form} />
                    </div>
                </CustomCol>
            </CustomRow>
        </CustomModal>
    );
};
