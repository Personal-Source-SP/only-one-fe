import type { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { TargetConfig } from './target-config.types';

export interface FeatureTestInput {
    url?: string;
    query?: string;
    itemUrl?: string;
    htmlContentString?: string;
    dataContent?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface TestFeatureStatelessRequest {
    config: TargetConfig;
    service: ScraperServiceEnum;
    type: DataProviderFeatureType;
    input?: FeatureTestInput;
}

export interface SearchResultItem {
    url: string;
    title?: string;
    imageUrl?: string;
    relativeUrl?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface ScrapeItemDataResponseItem {
    id: string;
    url: string;
    mimeType?: string;
    lastModified?: Date;
    [key: string]: unknown;
}

export interface IExtractDataResponse {
    html?: string;
    error?: string;
    data?: ScrapeItemDataResponseItem[];
}

export interface ISearchExtractDataResponse {
    html?: string;
    error?: string;
    data?: SearchResultItem[];
}

export type FeatureTestResult = IExtractDataResponse | ISearchExtractDataResponse;
