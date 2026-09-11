import { API_ENDPOINT } from '@/config';
import { DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { formatJsonString, safeParseJson } from '@/utilities';
import type { IDataProvider } from '../../data-providers/types';
import { DEFAULT_TARGET_CONFIG } from '../constants';
import { DataProviderFeatureStatus, DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { IDataProviderFeature, ScrapingConfigFormValues, TargetConfig } from '../types';

export interface MapConfigToBaseFormValuesParams {
    defaultTemplate?: string;
    service?: ScraperServiceEnum;
    config?: TargetConfig | Record<string, unknown>;
    defaultConfig?: TargetConfig | Record<string, unknown>;
}
export const mapConfigToBaseFormValues = ({
    defaultTemplate = DEFAULT_PARSER_FUNCTION_GENERATOR,
    service = ScraperServiceEnum.GENERIC,
    config = {},
    defaultConfig = DEFAULT_TARGET_CONFIG,
}: MapConfigToBaseFormValuesParams = {}): Record<string, unknown> => {
    const rawHeaders =
        (config as Record<string, unknown>).headers ??
        (defaultConfig as Record<string, unknown>).headers;
    const rawCookies =
        (config as Record<string, unknown>).cookies ??
        (defaultConfig as Record<string, unknown>).cookies;

    return {
        ...defaultConfig,
        ...config,
        service,
        changeDescription: '',
        functionGenerator: (config as Record<string, unknown>).functionGenerator || defaultTemplate,
        headers: rawHeaders ? formatJsonString(rawHeaders) || undefined : undefined,
        cookies: rawCookies ? formatJsonString(rawCookies) || undefined : undefined,
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
        ? API_ENDPOINT.DATA_PROVIDER_FEATURES.BASE
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
        payload.dataProviderId = feature.dataProviderId;
    }

    return {
        method,
        endpoint,
        payload,
    };
};
