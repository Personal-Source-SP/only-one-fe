import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import { ScraperServiceEnum } from './enums';
import type { ISearchTargetConfig, ITargetConfig } from './types';

export const FEATURE_MODAL_WIDTH = 1300;

export const FEATURE_SECTION_CONTAINER_CLASS =
    'border border-hub-border/60 bg-hub-section/20 rounded-xl p-4 sm:p-5 w-full shadow-sm';

export const DEFAULT_TARGET_CONFIG: ITargetConfig = {
    maxResults: 10,
    retryDelay: 1000,
    retryAttempts: 3,
    timeout: 30000,
    waitForTimeout: 5000,
    isGetParentElement: false,
    stealthMode: false,
    cloudflareBypass: false,
    javascriptEnabled: false,
    imagesEnabled: false,
    cssEnabled: false,
};

export const DEFAULT_SEARCH_TARGET_CONFIG: ISearchTargetConfig = {
    ...DEFAULT_TARGET_CONFIG,
    queryPlaceholder: '{query}',
};

export interface IScraperServiceMetadata {
    label: string;
    value: ScraperServiceEnum;
    scrapingCodeLabel: string;
    searchCodeLabel: string;
    defaultScrapingTemplate: string;
    defaultSearchTemplate: string;
    hasDomSelectors: boolean;
    hasBrowserSettings: boolean;
    hasAdvancedHeaders: boolean;
    hasApiParams: boolean;
    hasNetworkRetries: boolean;
    hasUrlPattern: boolean;
    hasSearchSelectors: boolean;
    hasWaitForSelector: boolean;
}

export const SCRAPER_SERVICE_METADATA: Record<ScraperServiceEnum, IScraperServiceMetadata> = {
    [ScraperServiceEnum.GENERIC]: {
        label: 'Generic HTML Parser',
        value: ScraperServiceEnum.GENERIC,
        scrapingCodeLabel: 'Mã nguồn Hàm HTML Parser (functionGenerator)',
        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm HTML (functionGenerator)',
        defaultScrapingTemplate: DEFAULT_PARSER_FUNCTION_GENERATOR,
        defaultSearchTemplate: DEFAULT_SEARCH_FUNCTION_GENERATOR,
        hasDomSelectors: true,
        hasBrowserSettings: true,
        hasAdvancedHeaders: true,
        hasApiParams: false,
        hasNetworkRetries: true,
        hasUrlPattern: true,
        hasSearchSelectors: true,
        hasWaitForSelector: true,
    },
    [ScraperServiceEnum.API]: {
        label: 'API Scraper',
        value: ScraperServiceEnum.API,
        scrapingCodeLabel: 'Mã nguồn Hàm API Response Parser (functionGenerator)',
        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm API (functionGenerator)',
        defaultScrapingTemplate: DEFAULT_API_FUNCTION_GENERATOR,
        defaultSearchTemplate: DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
        hasDomSelectors: false,
        hasBrowserSettings: false,
        hasAdvancedHeaders: true,
        hasApiParams: true,
        hasNetworkRetries: true,
        hasUrlPattern: true,
        hasSearchSelectors: false,
        hasWaitForSelector: false,
    },
    [ScraperServiceEnum.LOCAL]: {
        label: 'Local Folder Scraper',
        value: ScraperServiceEnum.LOCAL,
        scrapingCodeLabel: 'Mã nguồn Hàm Local File Parser (functionGenerator)',
        searchCodeLabel: 'Mã nguồn Hàm Tìm kiếm Cục bộ (functionGenerator)',
        defaultScrapingTemplate: DEFAULT_PARSER_FUNCTION_GENERATOR,
        defaultSearchTemplate: DEFAULT_SEARCH_FUNCTION_GENERATOR,
        hasDomSelectors: false,
        hasBrowserSettings: false,
        hasAdvancedHeaders: false,
        hasApiParams: false,
        hasNetworkRetries: true,
        hasUrlPattern: false,
        hasSearchSelectors: false,
        hasWaitForSelector: false,
    },
};

export const SCRAPER_SERVICE_OPTIONS = Object.values(SCRAPER_SERVICE_METADATA).map((meta) => ({
    label: meta.label,
    value: meta.value,
}));

export const checkService = (service?: ScraperServiceEnum) => {
    const validService = service || ScraperServiceEnum.GENERIC;
    const meta = SCRAPER_SERVICE_METADATA[validService];

    return {
        service: validService,
        isApi: validService === ScraperServiceEnum.API,
        isLocal: validService === ScraperServiceEnum.LOCAL,
        isGeneric: validService === ScraperServiceEnum.GENERIC,
        ...meta,
    };
};
