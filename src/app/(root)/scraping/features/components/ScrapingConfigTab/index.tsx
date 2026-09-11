'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, DEFAULT_TARGET_CONFIG } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { useCurrentService, useFeatureConfigForm } from '../../hooks';
import type { FeatureConfigFormProps, ScrapingConfigFormValues } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { ScrapingBasicSection } from './ScrapingBasicSection';
import { ScrapingSelectorsSection } from './ScrapingSelectorsSection';

export const ScrapingConfigTab = ({
    feature: propFeature,
    form: propForm,
    selectedVersion: propSelectedVersion,
    onClose: propOnClose,
    onSuccess: propOnSuccess,
    onSaveForm: propOnSaveForm,
}: FeatureConfigFormProps) => {
    const context = useFeatureModalContext();
    const feature = propFeature ?? context.feature;
    const form = propForm ?? context.form;
    const selectedVersion =
        propSelectedVersion !== undefined ? propSelectedVersion : context.selectedVersion;
    const onClose = propOnClose ?? context.onClose;
    const onSuccess = propOnSuccess ?? context.onSuccess;
    const onSaveForm = propOnSaveForm ?? context.onSaveForm;

    const currentService = useCurrentService();

    const { hasBrowserSettings, hasAdvancedHeaders, hasDomSelectors, hasWaitForSelector } =
        checkService(currentService);

    const { handleServiceChange, handleSave } = useFeatureConfigForm<ScrapingConfigFormValues>({
        form,
        feature,
        selectedVersion,
        featureLabel: 'cào',
        defaultTargetConfig: DEFAULT_TARGET_CONFIG,
        onClose,
        onSuccess,
        onSaveForm,
        getDefaultTemplate: (service) => checkService(service).defaultScrapingTemplate,
    });

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                <ScrapingBasicSection onServiceChange={handleServiceChange} />

                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
                    <ScrapingSelectorsSection />
                )}

                <FeatureLimitsSection />

                {(hasBrowserSettings || hasAdvancedHeaders) && <FeatureAdvancedSection />}

                <FeatureCodeSection />
            </CustomFlex>
        </CustomForm>
    );
};
