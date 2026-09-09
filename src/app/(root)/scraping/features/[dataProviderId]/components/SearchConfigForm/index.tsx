'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
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
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export type SearchConfigFormProps = {
    feature: IDataProviderFeature;
    form?: FormInstance;
    selectedVersion?: IConfigVersion | null;
    isViewingHistory?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    setIsSaving?: (loading: boolean) => void;
};

export const SearchConfigForm = ({
    feature,
    form: externalForm,
    selectedVersion,
    isViewingHistory,
    onClose,
    onSuccess,
    setIsSaving: externalSetIsSaving,
}: SearchConfigFormProps) => {
    const { handleCustomMutationData } = useCustomMutationData();

    const [internalForm] = CustomForm.useForm();
    const form = externalForm || internalForm;

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { hasSearchSelectors, hasBrowserSettings } = checkService(currentService);

    useEffect(() => {
        externalSetIsSaving?.(isSaving);
    }, [isSaving, externalSetIsSaving]);

    useEffect(() => {
        const config = selectedVersion?.config || feature.config || {};
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        const { defaultSearchTemplate } = checkService(service);

        form.setFieldsValue({
            service,
            changeDescription: '',
            searchUrlPattern: config.searchUrlPattern || '',
            queryPlaceholder: config.queryPlaceholder || '{query}',
            mainContentSelector: config.mainContentSelector || '',
            resultSelector: config.resultSelector || '',
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
            functionGenerator: config.functionGenerator || defaultSearchTemplate,
        });
    }, [feature, selectedVersion, form]);

    const isDraft = useMemo(() => !feature.id, [feature.id]);

    const handleServiceChange = useCallback(
        (service: string) => {
            const { defaultSearchTemplate } = checkService(service);
            form.setFieldValue('functionGenerator', defaultSearchTemplate);
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
                payload.changeDescription = changeDescription || 'Cập nhật cấu hình tìm kiếm';
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
                                ? 'Khởi tạo và lưu cấu hình tìm kiếm thành công'
                                : 'Lưu cấu hình tìm kiếm thành công',
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
                <SearchUrlPatternSection
                    service={currentService}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onServiceChange={handleServiceChange}
                />

                {hasSearchSelectors && (
                    <SearchSelectorsSection
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
                    <FeatureChangeLogSection placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                )}
            </CustomFlex>
        </CustomForm>
    );
};
