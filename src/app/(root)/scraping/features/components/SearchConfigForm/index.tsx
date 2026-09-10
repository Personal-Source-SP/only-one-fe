'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
import {
    ConfigGroupContainer,
    FeatureAdvancedSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export const SearchConfigForm = ({
    feature,
    form,
    selectedVersion,
    isViewingHistory,
    onClose,
    onSuccess,
    externalSetIsSaving,
}: FeatureConfigFormProps) => {
    const { handleCustomMutationData } = useCustomMutationData();

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { hasSearchSelectors, hasBrowserSettings, hasAdvancedHeaders } =
        checkService(currentService);

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
            queryPlaceholder:
                config.queryPlaceholder || DEFAULT_SEARCH_TARGET_CONFIG.queryPlaceholder,
            mainContentSelector: config.mainContentSelector || '',
            resultSelector: config.resultSelector || '',
            waitForSelector: config.waitForSelector || '',
            userAgent: config.userAgent || '',
            maxResults: config.maxResults ?? DEFAULT_SEARCH_TARGET_CONFIG.maxResults,
            retryDelay: config.retryDelay ?? DEFAULT_SEARCH_TARGET_CONFIG.retryDelay,
            retryAttempts: config.retryAttempts ?? DEFAULT_SEARCH_TARGET_CONFIG.retryAttempts,
            timeout: config.timeout ?? DEFAULT_SEARCH_TARGET_CONFIG.timeout,
            waitForTimeout: config.waitForTimeout ?? DEFAULT_SEARCH_TARGET_CONFIG.waitForTimeout,
            queryParams: config.queryParams || '',
            firstQueryParams: config.firstQueryParams || '',
            headers: config.headers ? JSON.stringify(config.headers, null, 2) : '',
            cookies: config.cookies ? JSON.stringify(config.cookies, null, 2) : '',
            isGetParentElement:
                config.isGetParentElement ?? DEFAULT_SEARCH_TARGET_CONFIG.isGetParentElement,
            stealthMode: config.stealthMode ?? DEFAULT_SEARCH_TARGET_CONFIG.stealthMode,
            cloudflareBypass:
                config.cloudflareBypass ?? DEFAULT_SEARCH_TARGET_CONFIG.cloudflareBypass,
            javascriptEnabled:
                config.javascriptEnabled ?? DEFAULT_SEARCH_TARGET_CONFIG.javascriptEnabled,
            imagesEnabled: config.imagesEnabled ?? DEFAULT_SEARCH_TARGET_CONFIG.imagesEnabled,
            cssEnabled: config.cssEnabled ?? DEFAULT_SEARCH_TARGET_CONFIG.cssEnabled,
            functionGenerator: config.functionGenerator || defaultSearchTemplate,
        });
    }, [feature, selectedVersion, form]);

    const isDraft = useMemo(() => !feature.id, [feature.id]);

    const handleServiceChange = useCallback(
        (service: ScraperServiceEnum) => {
            const { defaultSearchTemplate } = checkService(service);
            form.setFieldValue('functionGenerator', defaultSearchTemplate);
        },
        [form],
    );

    const handleSave = useCallback(
        async (values: SearchConfigFormValues): Promise<void> => {
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            let parsedHeaders: Record<string, string> | undefined;
            let parsedCookies: Array<Record<string, unknown>> | undefined;

            try {
                if (values.headers?.trim()) {
                    parsedHeaders = JSON.parse(values.headers);
                }
                if (values.cookies?.trim()) {
                    parsedCookies = JSON.parse(values.cookies);
                }
            } catch {
                // If invalid JSON, let it fall through or form validation catch it
            }

            const targetConfig: Record<string, unknown> = {
                ...configValues,
                ...(parsedHeaders ? { headers: parsedHeaders } : {}),
                ...(parsedCookies ? { cookies: parsedCookies } : {}),
            };

            const method = isDraft ? 'post' : 'put';
            const endpoint = isDraft
                ? `data-provider-features/provider/${feature.dataProviderId}`
                : `data-provider-features/${feature.id}`;

            const payload: Record<string, unknown> = {
                config: targetConfig,
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
                <ConfigGroupContainer
                    title="Cấu hình tính năng tìm kiếm"
                    description="Các tham số đặc thù định tuyến URL và bóc tách kết quả tìm kiếm"
                    badge="Đặc thù"
                    badgeColor="blue"
                    icon="lucide:search"
                >
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
                </ConfigGroupContainer>

                <ConfigGroupContainer
                    title="Cấu hình hệ thống & Thực thi"
                    description="Các tham số dùng chung về giới hạn, mạng, trình duyệt và bộ parser"
                    badge="Dùng chung"
                    badgeColor="purple"
                    icon="lucide:settings-2"
                >
                    <FeatureLimitsSection
                        service={currentService}
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />

                    {(hasBrowserSettings || hasAdvancedHeaders) && (
                        <FeatureAdvancedSection
                            service={currentService}
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
                </ConfigGroupContainer>
            </CustomFlex>
        </CustomForm>
    );
};
