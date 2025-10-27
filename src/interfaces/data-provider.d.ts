import { DataProviderSearchStatus, DataProviderStatus, ProductMappingStatus } from '@/enums';
import { Abstract } from '@/interfaces/common';

export declare namespace NDataProvider {
    interface IItem extends Abstract {
        name: string;
        mappingStatus: ProductMappingStatus;
        code?: string;
        tags?: string[];
    }

    interface ITargetConfig {
        functionGenerator: string;

        mainContentSelector?: string;
        isGetParentElement?: boolean;

        queryParams?: string;

        retryDelay?: number;
        retryAttempts?: number;
        userAgent?: string;
        headers?: Record<string, any>;
        cookies?: Record<string, any>;

        stealthMode?: boolean;
        cloudflareBypass?: boolean;
        waitForSelector?: string;
        javascriptEnabled?: boolean;
        imagesEnabled?: boolean;
        cssEnabled?: boolean;
    }

    interface ISearchConfig {
        // Search URL Configuration
        searchUrlPattern: string;
        queryPlaceholder: string;

        // Search Result Parsing Configuration
        mainContentSelector: string;
        resultSelector: string;

        // Limits (first page only)
        maxResults: number;

        // Request Configuration
        functionGenerator: string;
        isGetParentElement: boolean;
    }

    interface UpdateTargetConfigRequest extends ITargetConfig {
        scraperService?: string;
    }

    interface IDataProvider extends Abstract {
        identifier?: string;
        name: string;
        scraperService: string;
        baseUrl: string;
        status: DataProviderStatus;
        targetConfig?: ITargetConfig;
        lastSuccessfulScrapeAt?: Date;
        searchConfig?: ISearchConfig;
        searchService: string;
        searchStatus: DataProviderSearchStatus;
        dataProviderItems?: IDataProviderItem[];
    }

    interface IDataProviderItem extends Abstract {
        itemId: string;
        dataProviderId: string;
        itemUrl: string;
        targetConfig: Record<string, any> | null;
        lastScrapedTimestamp?: Date;
        item: IItem;
        dataProvider: IDataProvider;
    }

    interface IDataHistory extends Abstract {
        dataProviderItemId: string;
        scrapeTimestamp: Date;
        dataId?: string;
        type?: string;
        url?: string;
        lastModified?: Date;
        metadata?: Record<string, any>;
        dataProviderItem?: IDataProviderItem;
    }

    interface IScrapeDataResponse {
        process: number;
        success: number;
        error: number;

        errorsMessage?: string;

        dataItems?: {
            dataProviderId: string;
            dataProviderName: string;
            errorMessage?: string;
            data?: Record<string, any>;
            itemUrl?: string;
            dataProviderItemId?: string;
        }[];
    }
}
