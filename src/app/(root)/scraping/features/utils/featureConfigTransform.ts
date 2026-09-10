import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { DEFAULT_TARGET_CONFIG } from '../constants';
import { DataProviderFeatureStatus, DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { IDataProviderFeature, ScrapingConfigFormValues } from '../types';

export const safeParseJson = <T = unknown>(value?: string): T | undefined => {
    if (!value || typeof value !== 'string' || !value.trim()) {
        return undefined;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return undefined;
    }
};

export const formatJsonString = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return '';
    }
};

export interface MapConfigToBaseFormValuesParams {
    config?: Record<string, any>;
    service?: ScraperServiceEnum;
    defaultConfig?: Record<string, any>;
    defaultTemplate?: string;
}

export const mapConfigToBaseFormValues = ({
    config = {},
    service = ScraperServiceEnum.GENERIC,
    defaultConfig = DEFAULT_TARGET_CONFIG,
    defaultTemplate = DEFAULT_PARSER_FUNCTION_GENERATOR,
}: MapConfigToBaseFormValuesParams = {}): ScrapingConfigFormValues => {
    return {
        service,
        changeDescription: '',
        functionGenerator: config.functionGenerator || defaultTemplate,
        mainContentSelector: config.mainContentSelector || '',
        waitForSelector: config.waitForSelector || '',
        userAgent: config.userAgent || '',
        maxResults: config.maxResults ?? defaultConfig.maxResults,
        retryDelay: config.retryDelay ?? defaultConfig.retryDelay,
        retryAttempts: config.retryAttempts ?? defaultConfig.retryAttempts,
        timeout: config.timeout ?? defaultConfig.timeout,
        waitForTimeout: config.waitForTimeout ?? defaultConfig.waitForTimeout,
        queryParams: config.queryParams || '',
        firstQueryParams: config.firstQueryParams || '',
        headers: formatJsonString(config.headers),
        cookies: formatJsonString(config.cookies),
        isGetParentElement: config.isGetParentElement ?? defaultConfig.isGetParentElement,
        stealthMode: config.stealthMode ?? defaultConfig.stealthMode,
        cloudflareBypass: config.cloudflareBypass ?? defaultConfig.cloudflareBypass,
        javascriptEnabled: config.javascriptEnabled ?? defaultConfig.javascriptEnabled,
        imagesEnabled: config.imagesEnabled ?? defaultConfig.imagesEnabled,
        cssEnabled: config.cssEnabled ?? defaultConfig.cssEnabled,
    };
};

export const extractTargetConfigFromFormValues = (
    formValues?: Partial<ScrapingConfigFormValues>,
    fallbackConfig?: Record<string, unknown>,
): Record<string, unknown> => {
    if (!formValues) return fallbackConfig || {};

    const { service: _s, changeDescription: _cd, ...configValues } = formValues;
    if (Object.keys(configValues).length === 0) {
        return fallbackConfig || {};
    }

    const parsedHeaders =
        typeof configValues.headers === 'string'
            ? safeParseJson<Record<string, string>>(configValues.headers)
            : configValues.headers;

    const parsedCookies =
        typeof configValues.cookies === 'string'
            ? safeParseJson<Array<Record<string, unknown>>>(configValues.cookies)
            : configValues.cookies;

    return {
        ...configValues,
        ...(parsedHeaders !== undefined ? { headers: parsedHeaders } : {}),
        ...(parsedCookies !== undefined ? { cookies: parsedCookies } : {}),
    };
};

export interface CreateDefaultDraftFeatureParams {
    dataProviderId: string;
    type: DataProviderFeatureType;
    provider?: IDataProvider;
    config?: Record<string, unknown>;
}

export const createDefaultDraftFeature = ({
    dataProviderId,
    type,
    provider,
    config = DEFAULT_TARGET_CONFIG,
}: CreateDefaultDraftFeatureParams): IDataProviderFeature => {
    return {
        id: '',
        dataProviderId,
        type,
        service: ScraperServiceEnum.GENERIC,
        status: DataProviderFeatureStatus.UNCONFIGURED,
        consecutiveFailures: 0,
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        dataProvider: provider,
    };
};

export interface BuildMutationPayloadParams<TValues extends ScrapingConfigFormValues> {
    values: TValues;
    feature: IDataProviderFeature;
    isDraft: boolean;
    featureLabel?: string;
}

export const buildFeatureMutationPayload = <TValues extends ScrapingConfigFormValues>({
    values,
    feature,
    isDraft,
    featureLabel = 'tính năng',
}: BuildMutationPayloadParams<TValues>) => {
    const { service, changeDescription } = values;
    const targetConfig = extractTargetConfigFromFormValues(
        values,
        feature.config as Record<string, unknown>,
    );

    const method: 'post' | 'put' = isDraft ? 'post' : 'put';
    const endpoint = isDraft
        ? API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(feature.dataProviderId)
        : API_ENDPOINT.DATA_PROVIDER_FEATURES.DETAIL(feature.id);

    const payload: Record<string, unknown> = {
        config: targetConfig,
        service: service || ScraperServiceEnum.GENERIC,
    };

    if (!isDraft) {
        payload.changeDescription = changeDescription || `Cập nhật cấu hình ${featureLabel}`;
    } else {
        payload.type = feature.type;
    }

    return {
        method,
        endpoint,
        payload,
    };
};
