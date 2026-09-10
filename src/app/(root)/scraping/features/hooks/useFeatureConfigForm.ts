'use client';

import type { FormInstance } from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { checkService, DEFAULT_TARGET_CONFIG } from '../constants';
import { ScraperServiceEnum } from '../enums';
import type {
    IConfigVersion,
    IDataProviderFeature,
    ScrapingConfigFormValues,
    TargetConfig,
} from '../types';
import { buildFeatureMutationPayload, mapConfigToBaseFormValues } from '../utils';

export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
    form: FormInstance;
    feature: IDataProviderFeature;
    featureLabel?: string;
    selectedVersion?: IConfigVersion | null;
    defaultTargetConfig?: Record<string, unknown>;
    onClose: () => void;
    onSuccess: () => void;
    externalSetIsSaving?: (loading: boolean) => void;
    extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
    getDefaultTemplate?: (service: ScraperServiceEnum) => string;
}

export interface UseFeatureConfigFormReturn<TValues extends ScrapingConfigFormValues> {
    isDraft: boolean;
    isSaving: boolean;
    handleSave: (values: TValues) => Promise<void>;
    handleServiceChange: (service: ScraperServiceEnum) => void;
}

export const useFeatureConfigForm = <TValues extends ScrapingConfigFormValues>({
    feature,
    form,
    selectedVersion,
    featureLabel = 'tính năng',
    defaultTargetConfig = DEFAULT_TARGET_CONFIG,
    getDefaultTemplate,
    extraInitialValues,
    onSuccess,
    onClose,
    externalSetIsSaving,
}: UseFeatureConfigFormOptions<TValues>): UseFeatureConfigFormReturn<TValues> => {
    const isDraft = useMemo(() => !feature.id, [feature.id]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    useEffect(() => {
        externalSetIsSaving?.(isSaving);
    }, [isSaving, externalSetIsSaving]);

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

    const handleServiceChange = useCallback(
        (service: ScraperServiceEnum) => {
            const template = getDefaultTemplate
                ? getDefaultTemplate(service)
                : checkService(service).defaultScrapingTemplate;

            form.setFieldValue('functionGenerator', template);
        },
        [form, getDefaultTemplate],
    );

    const handleSave = useCallback(
        async (values: TValues): Promise<void> => {
            setIsSaving(true);

            const { method, endpoint, payload } = buildFeatureMutationPayload({
                values,
                feature,
                isDraft,
                featureLabel,
            });

            try {
                handleCustomMutationData({
                    method,
                    url: endpoint,
                    values: payload,
                    successNotification: () => {
                        setIsSaving(false);
                        onSuccess();
                        onClose();

                        return {
                            type: MessageType.SUCCESS,
                            message: isDraft
                                ? `Khởi tạo và lưu cấu hình ${featureLabel} thành công`
                                : `Lưu cấu hình ${featureLabel} thành công`,
                        };
                    },
                    errorNotification: (error) => {
                        setIsSaving(false);

                        return {
                            type: MessageType.ERROR,
                            description: error?.message,
                            message: isDraft
                                ? 'Khởi tạo cấu hình thất bại'
                                : 'Lưu cấu hình thất bại',
                        };
                    },
                });
            } finally {
                setIsSaving(false);
            }
        },
        [isDraft, feature, featureLabel, handleCustomMutationData, onSuccess, onClose],
    );

    return {
        isSaving,
        isDraft,
        handleServiceChange,
        handleSave,
    };
};
