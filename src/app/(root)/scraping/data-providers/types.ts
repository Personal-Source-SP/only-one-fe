import type {
    IDataProviderItem,
    IImportDataProvider,
} from '@/app/(root)/scraping/provider-items/types';
import type { DataProviderSearchStatus, DataProviderStatus } from '@/enums';
import type { Abstract } from '@/interfaces';

export interface ITargetConfig {
    functionGenerator: string;
    mainContentSelector?: string;
    isGetParentElement?: boolean;
    queryParams?: string;
    firstQueryParam?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    userAgent?: string;
    headers?: Record<string, unknown>;
    cookies?: Array<{
        name: string;
        value: string;
        domain?: string;
        path?: string;
    }>;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    waitForSelector?: string;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
}

export interface ISearchConfig {
    searchUrlPattern: string;
    queryPlaceholder: string;
    mainContentSelector: string;
    resultSelector: string;
    maxResults: number;
    functionGenerator: string;
    isGetParentElement: boolean;
}

export interface UpdateTargetConfigRequest extends ITargetConfig {
    scraperService?: string;
}

export interface IDataProvider extends Abstract {
    name: string;
    identifier: string;
    scraperService: string;
    baseUrl: string;
    status: DataProviderStatus;
    targetConfig?: ITargetConfig;
    lastSuccessfulScrapeAt?: Date;
    searchConfig?: ISearchConfig;
    searchService: string;
    searchStatus: DataProviderSearchStatus;
    features?: any[];
    dataProviderItems?: IDataProviderItem[];
}

export interface DataProviderFormValues {
    name: string;
    identifier: string;
    baseUrl: string;
}

export type DataProviderRecord = IDataProvider;
export type ImportDataProviderRecord = IImportDataProvider;
export type SettingConfigType = 'target' | 'search';
