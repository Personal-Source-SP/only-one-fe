export interface ITargetConfig {
    service?: string;
    functionGenerator?: string;

    mainContentSelector?: string;
    isGetParentElement?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    userAgent?: string;
    headers?: Record<string, string>;
    cookies?: Array<{
        name: string;
        value: string;
        domain?: string;
        path?: string;
    }>;
    timeout?: number;
    waitForTimeout?: number;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    waitForSelector?: string;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;

    [key: string]: unknown;
}

export interface ISearchTargetConfig extends ITargetConfig {
    searchUrlPattern?: string;
    queryPlaceholder?: string;
    resultSelector?: string;
    sampleQuery?: string;
}

export type TargetConfig = ITargetConfig | ISearchTargetConfig;
