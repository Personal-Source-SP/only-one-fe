'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { useMemo } from 'react';
import { getFeatureFormSections } from '../../constants';
import { useFeatureModalContext } from '../../context';
import type { FormEvaluationContext } from '../../types';
import { DynamicFormSection } from '../ConfigFormCommon/DynamicFormSection';

export const DynamicFeatureConfigForm = () => {
    const { form, currentService, feature, isViewingHistory, handleSave } =
        useFeatureModalContext();

    const evaluationContext: FormEvaluationContext = useMemo(
        () => ({
            isViewingHistory,
            service: currentService,
            featureType: feature.type,
            isServiceDisabled: Boolean(feature?.id || isViewingHistory),
        }),
        [currentService, isViewingHistory, feature.type, feature?.id],
    );

    const sections = useMemo(() => getFeatureFormSections(feature.type), [feature.type]);

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                {sections.map((section) => (
                    <DynamicFormSection
                        key={section.id}
                        section={section}
                        evaluationContext={evaluationContext}
                    />
                ))}
            </CustomFlex>
        </CustomForm>
    );
};
