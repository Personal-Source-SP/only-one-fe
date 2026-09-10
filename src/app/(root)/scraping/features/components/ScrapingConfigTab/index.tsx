'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, DEFAULT_TARGET_CONFIG } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { useFeatureConfigForm } from '../../hooks';
import type { FeatureConfigFormProps, ScrapingConfigFormValues } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { ScrapingBasicSection } from './ScrapingBasicSection';
import { ScrapingSelectorsSection } from './ScrapingSelectorsSection';

export const ScrapingConfigTab = ({
    feature,
    form,
    isViewingHistory,
    selectedVersion,
    onClose,
    onSuccess,
    externalSetIsSaving,
}: FeatureConfigFormProps) => {
    const headers = CustomForm.useWatch('headers', form);
    const cookies = CustomForm.useWatch('cookies', form);
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;

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
        externalSetIsSaving,
        getDefaultTemplate: (service) => checkService(service).defaultScrapingTemplate,
    });

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                <ScrapingBasicSection
                    feature={feature}
                    isViewingHistory={isViewingHistory}
                    selectedVersion={selectedVersion}
                    onServiceChange={handleServiceChange}
                />

                {(hasDomSelectors || hasWaitForSelector || hasBrowserSettings) && (
                    <ScrapingSelectorsSection
                        service={currentService}
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                )}

                <FeatureLimitsSection
                    service={currentService}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                {(hasBrowserSettings || hasAdvancedHeaders) && (
                    <FeatureAdvancedSection
                        form={form}
                        service={currentService}
                        headers={headers}
                        cookies={cookies}
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                )}

                <FeatureCodeSection
                    form={form}
                    service={currentService}
                    functionGenerator={functionGenerator}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />
            </CustomFlex>
        </CustomForm>
    );
};
