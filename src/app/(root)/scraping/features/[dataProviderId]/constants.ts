import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import { ScraperServiceEnum } from './enums';

export interface IScraperServiceMetadata {
    label: string;
    value: ScraperServiceEnum;
    scrapingCodeLabel: string;
    searchCodeLabel: string;
    defaultScrapingTemplate: string;
    defaultSearchTemplate: string;
    hasDomSelectors: boolean;
    hasBrowserSettings: boolean;
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
        defaultSearchTemplate: DEFAULT_API_FUNCTION_GENERATOR,
        hasDomSelectors: false,
        hasBrowserSettings: false,
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
        hasDomSelectors: true,
        hasBrowserSettings: false,
        hasNetworkRetries: false,
        hasUrlPattern: false,
        hasSearchSelectors: false,
        hasWaitForSelector: false,
    },
};

export const SCRAPER_SERVICE_OPTIONS = Object.values(SCRAPER_SERVICE_METADATA).map((meta) => ({
    label: meta.label,
    value: meta.value,
}));

export const checkService = (service?: string) => {
    const validService = (service as ScraperServiceEnum) || ScraperServiceEnum.GENERIC;
    const meta =
        SCRAPER_SERVICE_METADATA[validService] ||
        SCRAPER_SERVICE_METADATA[ScraperServiceEnum.GENERIC];

    return {
        service: validService,
        isApi: validService === ScraperServiceEnum.API,
        isLocal: validService === ScraperServiceEnum.LOCAL,
        isGeneric: validService === ScraperServiceEnum.GENERIC,
        meta,
        ...meta,
    };
};
