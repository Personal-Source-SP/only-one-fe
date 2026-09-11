'use client';

import { useCallback, useEffect } from 'react';
import { checkService, DEFAULT_TARGET_CONFIG } from '../constants';
import { useFeatureModalContext } from '../context';
import { ScraperServiceEnum } from '../enums';
import type { ScrapingConfigFormValues, TargetConfig } from '../types';
import { mapConfigToBaseFormValues } from '../utils';

export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
    defaultTargetConfig?: Record<string, unknown>;
    getDefaultTemplate?: (service: ScraperServiceEnum) => string;
    extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
}

export interface UseFeatureConfigFormReturn<TValues extends ScrapingConfigFormValues> {
    isDraft: boolean;
    isSaving: boolean;
    handleSave: (values: TValues) => Promise<void>;
    handleServiceChange: (service: ScraperServiceEnum) => void;
}

export const useFeatureConfigForm = <TValues extends ScrapingConfigFormValues>({
    defaultTargetConfig = DEFAULT_TARGET_CONFIG,
    getDefaultTemplate,
    extraInitialValues,
}: UseFeatureConfigFormOptions<TValues> = {}): UseFeatureConfigFormReturn<TValues> => {
    const { form, feature, selectedVersion, isDraft, isSaving, handleFormSubmit } =
        useFeatureModalContext();

    useEffect(() => {
        const config = (selectedVersion?.config || feature.config || {}) as TargetConfig;
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        const defaultTemplate = getDefaultTemplate
            ? getDefaultTemplate(service)
            : checkService(service).defaultScrapingTemplate;

        const baseInitialValues = mapConfigToBaseFormValues({
            config,
            service,
            defaultTemplate,
            defaultConfig: defaultTargetConfig,
        });
        const extraValues = extraInitialValues ? extraInitialValues(config) : {};

        form.setFieldsValue({ ...baseInitialValues, ...extraValues } as ScrapingConfigFormValues);
    }, [
        feature,
        selectedVersion,
        form,
        defaultTargetConfig,
        getDefaultTemplate,
        extraInitialValues,
    ]);

    const handleSave = useCallback(
        async (values: TValues): Promise<void> => {
            await handleFormSubmit(values as Record<string, unknown>);
        },
        [handleFormSubmit],
    );

    const handleServiceChange = useCallback(
        (service: ScraperServiceEnum) => {
            const template = getDefaultTemplate
                ? getDefaultTemplate(service)
                : checkService(service).defaultScrapingTemplate;

            form.setFieldValue('functionGenerator', template);
        },
        [form, getDefaultTemplate],
    );

    return {
        isSaving,
        isDraft,
        handleSave,
        handleServiceChange,
    };
};
