'use client';

import { CustomCol, CustomForm, CustomModal, CustomRow } from '@/components/custom-antd';
import { useState } from 'react';
import { DataProviderFeatureStatus } from '../../enums';
import { useFeatureVersionManager } from '../../hooks';
import type { IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';
import { FeatureChangeLogSection } from '../ConfigFormCommon';
import { FeatureTestTab } from '../FeatureTestTab';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

export type FeatureSettingModalProps = {
    open: boolean;
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
    onSwitchStatus: (featureId: string, currentStatus: DataProviderFeatureStatus) => void;
};

export const FeatureSettingModal = ({
    open,
    feature,
    onClose,
    onSuccess,
    onSwitchStatus,
}: FeatureSettingModalProps) => {
    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isDraft = !feature.id;
    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def.ConfigComponent;

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
            onCancel={onClose}
            bodyClassName="!p-2.5 sm:!p-3"
            className="top-6 max-w-[96vw]"
            title={
                <FeatureModalHeader
                    form={form}
                    feature={feature}
                    isDraft={isDraft}
                    authorName={authorName}
                    selectedVersion={selectedVersion}
                    onSwitchStatus={() => onSwitchStatus(feature.id, feature.status)}
                />
            }
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
        >
            <CustomRow gutter={[12, 12]}>
                <CustomCol xs={24} lg={13} xl={14}>
                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-3 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar">
                        <ConfigComponent
                            feature={feature}
                            form={form}
                            selectedVersion={selectedVersion}
                            isViewingHistory={isViewingHistory}
                            onClose={onClose}
                            onSuccess={onSuccess}
                            externalSetIsSaving={setIsSaving}
                        />
                    </div>
                </CustomCol>
                <CustomCol xs={24} lg={11} xl={10}>
                    <div className="border border-hub-border/60 rounded-xl p-2.5 sm:p-3 h-auto max-h-[70vh] lg:max-h-none lg:h-[calc(85vh-180px)] overflow-y-auto custom-scrollbar flex flex-col gap-3">
                        <FeatureTestTab feature={feature} configForm={form} />
                        {!isDraft && (
                            <CustomForm form={form} layout="vertical" component={false}>
                                <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                            </CustomForm>
                        )}
                    </div>
                </CustomCol>
            </CustomRow>
        </CustomModal>
    );
};
