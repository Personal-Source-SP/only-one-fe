import { API_ENDPOINT } from '@/config';
import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { formatJsonString, safeParseJson } from '@/utilities';
import type { IDataProvider } from '../../data-providers/types';
import { DEFAULT_TARGET_CONFIG } from '../constants';
import { DataProviderFeatureStatus, DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { IDataProviderFeature, ScrapingConfigFormValues, TargetConfig } from '../types';

export interface MapConfigToBaseFormValuesParams {
    config?: TargetConfig;
    defaultTemplate?: string;
    defaultConfig?: TargetConfig;
    service?: ScraperServiceEnum;
}
export const mapConfigToBaseFormValues = ({
    config = {},
    defaultTemplate = DEFAULT_PARSER_FUNCTION_GENERATOR,
    defaultConfig = DEFAULT_TARGET_CONFIG,
    service = ScraperServiceEnum.GENERIC,
}: MapConfigToBaseFormValuesParams = {}): ScrapingConfigFormValues => ({
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
});

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
    config?: TargetConfig;
    provider?: IDataProvider;
}
export const createDefaultDraftFeature = ({
    dataProviderId,
    type,
    config = DEFAULT_TARGET_CONFIG,
    provider,
}: CreateDefaultDraftFeatureParams): IDataProviderFeature => ({
    id: '',
    type,
    config,
    dataProviderId,
    consecutiveFailures: 0,
    dataProvider: provider,
    service: ScraperServiceEnum.GENERIC,
    status: DataProviderFeatureStatus.UNCONFIGURED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
});

export interface BuildMutationPayloadParams<TValues extends ScrapingConfigFormValues> {
    values: TValues;
    isDraft: boolean;
    feature: IDataProviderFeature;
    featureLabel?: string;
}
export const buildFeatureMutationPayload = <TValues extends ScrapingConfigFormValues>({
    values,
    isDraft,
    feature,
    featureLabel = 'tính năng',
}: BuildMutationPayloadParams<TValues>) => {
    const { service, changeDescription } = values;

    const method: 'post' | 'put' = isDraft ? 'post' : 'put';
    const endpoint = isDraft
        ? API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(feature.dataProviderId)
        : API_ENDPOINT.DATA_PROVIDER_FEATURES.DETAIL(feature.id);

    const targetConfig = extractTargetConfigFromFormValues(values, feature.config);
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
