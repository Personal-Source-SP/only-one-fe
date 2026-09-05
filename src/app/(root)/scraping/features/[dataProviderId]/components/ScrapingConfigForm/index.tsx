'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_API_FUNCTION_GENERATOR, DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import { ScraperServiceEnum } from '../../enums';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { ScrapingAdvancedSection } from './ScrapingAdvancedSection';
import { ScrapingBasicSection } from './ScrapingBasicSection';
import { ScrapingCodeSection } from './ScrapingCodeSection';
import { ScrapingLimitsSection } from './ScrapingLimitsSection';

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
    const [internalForm] = CustomForm.useForm();
    const form = externalForm || internalForm;

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isDraft = useMemo(() => !feature.id, [feature.id]);
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

    const { handleCustomMutationData } = useCustomMutationData();

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

    const handleServiceChange = useCallback(
        (service: string) => {
            switch (service) {
                case ScraperServiceEnum.API:
                    form.setFieldValue('functionGenerator', DEFAULT_API_FUNCTION_GENERATOR);
                    break;
                case ScraperServiceEnum.GENERIC:
                    form.setFieldValue('functionGenerator', DEFAULT_PARSER_FUNCTION_GENERATOR);
                    break;
                default:
                    break;
            }
        },
        [form],
    );

    const handleSave = useCallback(
        async (values: any): Promise<void> => {
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            const method = isDraft ? 'post' : 'put';
            const endpoint = isDraft
                ? `data-provider-features/data-providers/${feature.dataProviderId}`
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
                    isViewingHistory={isViewingHistory}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    onServiceChange={handleServiceChange}
                />

                <ScrapingLimitsSection
                    isViewingHistory={isViewingHistory}
                    feature={feature}
                    selectedVersion={selectedVersion}
                />

                <ScrapingAdvancedSection
                    isViewingHistory={isViewingHistory}
                    feature={feature}
                    selectedVersion={selectedVersion}
                />

                <ScrapingCodeSection
                    form={form}
                    functionGenerator={functionGenerator}
                    isViewingHistory={isViewingHistory}
                    feature={feature}
                    selectedVersion={selectedVersion}
                />

                {!isDraft && (
                    <CustomFlex
                        vertical
                        className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                    >
                        <CustomFlex align="center" gap="small" className="mb-2">
                            <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                            <CustomTypography.Text strong className="text-sm text-hub-title">
                                Mô tả thay đổi phiên bản (Change Log)
                            </CustomTypography.Text>
                        </CustomFlex>
                        <CustomForm.Item name="changeDescription" className="!mb-0">
                            <CustomInput placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                        </CustomForm.Item>
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomForm>
    );
};
