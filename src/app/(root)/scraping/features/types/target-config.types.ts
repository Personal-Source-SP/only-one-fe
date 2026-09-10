import type { ScraperServiceEnum } from '../enums';

export interface CookieItem {
    name: string;
    value: string;
    domain?: string;
    path?: string;
}

export interface ITargetConfigLimits {
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    timeout?: number;
    waitForTimeout?: number;
}

export interface ITargetConfigNetwork {
    userAgent?: string;
    headers?: Record<string, string>;
    cookies?: Array<CookieItem>;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
}

export interface ITargetConfigSelectors {
    mainContentSelector?: string;
    waitForSelector?: string;
    isGetParentElement?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
}

export interface ITargetConfigCode {
    functionGenerator?: string;
}

export interface ITargetConfig
    extends ITargetConfigLimits, ITargetConfigNetwork, ITargetConfigSelectors, ITargetConfigCode {
    service?: ScraperServiceEnum;
    [key: string]: unknown;
}

export interface ISearchTargetConfigSpecific {
    searchUrlPattern?: string;
    queryPlaceholder?: string;
    resultSelector?: string;
}

export interface ISearchTargetConfig extends ITargetConfig, ISearchTargetConfigSpecific {}

export type TargetConfig = ITargetConfig | ISearchTargetConfig;
