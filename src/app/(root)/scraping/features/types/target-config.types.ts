export interface ITargetConfig {
    functionGenerator: string;

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
}

export interface ISearchTargetConfig extends ITargetConfig {
    searchUrlPattern?: string;
    queryPlaceholder?: string;
    resultSelector?: string;
    sampleQuery?: string;
}

export interface IRunFunctionExtractData {
    htmlContent: string;
    functionGenerator: string;
    mainContentSelector: string;
    isGetParentElement: boolean;
}

export interface IRunApiFunctionExtractData {
    data: Record<string, any>;
    functionGenerator: string;
}

export interface IRunSearchFunctionExtractData {
    htmlContent: string;
    functionGenerator: string;
    resultSelector?: string;
    maxResults?: number;
    mainContentSelector?: string;
    isGetParentElement?: boolean;
}

export interface IRunApiSearchFunctionExtractData {
    data: Record<string, any>;
    functionGenerator: string;
    maxResults?: number;
}

export interface ISearchExtractDataResponse {
    html?: string;
    error?: string;
    data?: Array<Record<string, any>>;
}
