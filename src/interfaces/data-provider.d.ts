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

        maxResults?: number;
        retryDelay?: number;
        retryAttempts?: number;
        userAgent?: string;
        headers?: Record<string, any>;
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
        itemUrl: string;
        dataProviderId: string;
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
        dataProvider?: IDataProvider;
        dataProviderItem?: IDataProviderItem;
    }

    interface IScrapeDataResponse {
        process: number;
        success: number;
        error: number;

        errorsMessage?: string;

        successData?: {
            dataProviderId: string;
            dataProviderName: string;
            dataProviderItemId: string;
            dataProviderItemUrl: string;

            dataId: string;
            data: Record<string, any>;
            url: string;
            mimeType: string;
            lastModified?: Date;
        }[];

        errors?: {
            dataProviderId: string;
            errorMessage: string;
            dataProviderItemId?: string;
        }[];
    }

    interface IPreviewImportItemResponse {
        statistics?: {
            errors: number;
            updates: number;
            overridden: number;
        };
        items: IItem[];
    }

    interface IImportItemResponse {
        success: boolean;
        message: string;
        updated: number;
        validationErrorMessages?: string[];
    }
}
