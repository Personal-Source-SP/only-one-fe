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

export const ScrapingConfigTab = (_props?: FeatureConfigFormProps) => {
    const { form } = useFeatureModalContext();
    const currentService = useCurrentService();

    const { hasBrowserSettings, hasAdvancedHeaders, hasDomSelectors, hasWaitForSelector } =
        checkService(currentService);

    const { handleServiceChange, handleSave } = useFeatureConfigForm<ScrapingConfigFormValues>({
        featureLabel: 'cào',
        defaultTargetConfig: DEFAULT_TARGET_CONFIG,
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
