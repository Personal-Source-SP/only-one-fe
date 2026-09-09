'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureChangeLogSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { ScrapingBasicSection } from './ScrapingBasicSection';
import { ScrapingSelectorsSection } from './ScrapingSelectorsSection';

export type ScrapingConfigFormProps = {
    feature: IDataProviderFeature;
    form?: FormInstance;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onClose: () => void;
    onSuccess: () => void;
    setIsSaving?: (loading: boolean) => void;
};

export const ScrapingConfigForm = ({
    feature,
    form: externalForm,
    isViewingHistory,
    selectedVersion,
    onClose,
    onSuccess,
    setIsSaving: externalSetIsSaving,
}: ScrapingConfigFormProps) => {
    const { handleCustomMutationData } = useCustomMutationData();

    const [internalForm] = CustomForm.useForm();
    const form = externalForm || internalForm;

    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { hasBrowserSettings, hasDomSelectors, hasWaitForSelector } =
        checkService(currentService);

    useEffect(() => {
        externalSetIsSaving?.(isSaving);
    }, [isSaving, externalSetIsSaving]);

    useEffect(() => {
        const config = selectedVersion?.config || feature.config || {};
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        form.setFieldsValue({
            service,
            changeDescription: '',
            functionGenerator: config.functionGenerator || DEFAULT_PARSER_FUNCTION_GENERATOR,
            mainContentSelector: config.mainContentSelector || '',
            waitForSelector: config.waitForSelector || '',
            userAgent: config.userAgent || '',
            maxResults: config.maxResults ?? 10,
            retryDelay: config.retryDelay ?? 1000,
            retryAttempts: config.retryAttempts ?? 3,
            isGetParentElement: config.isGetParentElement ?? false,
            stealthMode: config.stealthMode ?? false,
            cloudflareBypass: config.cloudflareBypass ?? false,
            javascriptEnabled: config.javascriptEnabled ?? true,
            imagesEnabled: config.imagesEnabled ?? false,
            cssEnabled: config.cssEnabled ?? false,
        });
    }, [feature, selectedVersion, form]);

    const isDraft = useMemo(() => !feature.id, [feature.id]);

    const handleServiceChange = useCallback(
        (service: string) => {
            const { defaultScrapingTemplate } = checkService(service);
            form.setFieldValue('functionGenerator', defaultScrapingTemplate);
        },
        [form],
    );

    const handleSave = useCallback(
        async (values: any): Promise<void> => {
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            const method = isDraft ? 'post' : 'put';
            const endpoint = isDraft
                ? `data-provider-features/provider/${feature.dataProviderId}`
                : `data-provider-features/${feature.id}`;

            const payload: Record<string, any> = {
                config: configValues,
                service: service || ScraperServiceEnum.GENERIC,
            };

            if (!isDraft) {
                payload.changeDescription = changeDescription || 'Cập nhật cấu hình cào';
            } else {
                payload.type = feature.type;
            }

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
                                ? 'Khởi tạo và lưu cấu hình cào thành công'
                                : 'Lưu cấu hình cào thành công',
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
        [isDraft, feature, handleCustomMutationData, onSuccess, onClose],
    );

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

                {hasBrowserSettings && (
                    <FeatureAdvancedSection
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

                {!isDraft && (
                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                )}
            </CustomFlex>
        </CustomForm>
    );
};
