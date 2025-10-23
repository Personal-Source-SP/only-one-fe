import {
    DataProviderSearchStatus,
    DataProviderStatus,
    ProductMappingStatus,
    ScrapeStatusEnum,
} from '@/enums';
import { IAbstract } from '@/interfaces/common';

export declare namespace NDataProvider {
    interface IItem extends IAbstract {
        name: string;
        mappingStatus: ProductMappingStatus;
        code?: string;
        tags?: string[];
    }

    interface ITargetConfig {
        useBrowser: boolean; // Using config use_browser in scraper service
        functionGenerator: string; // Function generator
        mainContentSelector: string; // Main selector for getting main content
        isGetParentElement: boolean; // Get parent element of main content
        useProxy?: boolean; // Use proxy for scraping
        proxyCountries?: string[]; // List of countries to select proxies from
        proxyProviders?: string[]; // List of specific proxy providers to use
        useVisionExtraction?: boolean; // Use vision extraction for scraping
        visionMainSelector?: string; // Main selector for vision extraction
        cookieConsentSelector?: string; // CSS selector for cookie consent element to hide
        waitForElement?: string; // Wait for element to be visible
    }

    interface ISearchConfig {
        // Search URL Configuration
        searchUrlPattern: string; // e.g., "/search?q={query}&category=all"
        queryPlaceholder: string; // e.g., "{query}" in the URL pattern (default: "{query}")

        // Search Result Parsing Configuration
        mainContentSelector: string; // CSS selector for individual product items within mainContentSelector
        resultSelector: string; // CSS selector for individual product items within resultSelector

        // Limits (first page only)
        maxResults: number; // Maximum number of results to parse from first page (default: 20)

        // Request Configuration
        useBrowser: boolean; // Using config use_browser in scraper service
        functionGenerator: string; // Function generator
        isGetParentElement: boolean; // Get parent element of main content
        useProxy?: boolean; // Use proxy for scraping
        proxyCountries?: string[]; // List of countries to select proxies from
        proxyProviders?: string[]; // List of specific proxy providers to use
        waitForElement?: string; // Wait for element to be visible
        enableBarcodeSearch?: boolean; // Enable barcode search instead of product name
    }

    interface IDataProvider extends IAbstract {
        identifier?: string;
        name: string;
        scraperService: string;
        baseUrl: string;
        status: DataProviderStatus;
        targetConfig?: ITargetConfig;
        lastSuccessfulScrapeAt?: Date;
        lastFailedScrapeAt?: Date;
        searchConfig?: ISearchConfig;
        searchService: string;
        searchStatus: DataProviderSearchStatus;
        dataProviderItems?: IDataProviderItem[];
    }

    interface IDataProviderItem extends IAbstract {
        itemId: string;
        dataProviderId: string;
        itemUrl: string;
        targetConfig: Record<string, any> | null;
        lastScrapeStatus?: ScrapeStatusEnum;
        lastScrapedTimestamp?: Date;
        item: IItem;
        dataProvider: IDataProvider;
    }

    interface IDataHistory extends IAbstract {
        dataProviderItemId: string;
        scrapeTimestamp: Date;
        status: ScrapeStatusEnum;
        metadata?: Record<string, any>;
        errorMessage?: string;
        dataProviderItem?: IDataProviderItem;
    }
}
