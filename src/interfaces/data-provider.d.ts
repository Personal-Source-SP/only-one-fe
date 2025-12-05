import {
    DataProviderSearchStatus,
    DataProviderStatus,
    DisplayType,
    ProductMappingStatus,
} from '@/enums';
import { Abstract } from '@/interfaces/common';
import { NCloudData } from './cloud-data';

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
        firstQueryParam?: string;

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
        name: string;
        identifier: string;
        scraperService: string;
        baseUrl: string;
        status: DataProviderStatus;
        targetConfig?: ITargetConfig;
        lastSuccessfulScrapeAt?: Date;
        searchConfig?: ISearchConfig;
        parentId?: string;
        searchService: string;
        searchStatus: DataProviderSearchStatus;
        dataProviderItems?: IDataProviderItem[];
        parent?: IDataProvider;
        children?: IDataProvider[];
    }

    interface IDataProviderItem extends Abstract {
        itemId: string;
        itemUrl: string;
        dataProviderId: string;
        isActive: boolean;
        isSavedToCloudData: boolean;
        displayType: DisplayType;
        cloudDataProviderId?: string;
        lastScrapedTimestamp?: Date;

        item: IItem;
        dataProvider: IDataProvider;
        cloudDataProvider?: NCloudData.ICloudDataProvider;
    }

    interface IScrapingData extends Abstract {
        dataProviderId: string;
        dataProviderItemId: string;
        itemId: string;
        scrapeTimestamp: Date;
        dataId?: string;
        type?: string;
        url?: string;
        lastModified?: Date;
        metadata?: Record<string, any>;
        cloudDataItemId?: string;
        cloudDataUrl?: string;

        dataProvider?: IDataProvider;
        dataProviderItem?: IDataProviderItem;
        item?: IItem;
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

    interface IImportDataProvider {
        itemName: string;
        itemCode: string;
        itemUrl: string;
        dataProviderIdentifier: string;
        itemId?: string;
        dataProviderId?: string;
        dataProviderName?: string;
    }

    interface IScrapeDataRequest {
        checkDuplicateData: boolean;
        mimeTypes?: MimeType[];
        itemIds?: string[];
        dataProviderItemIds?: string[];
        lastSuccessfulScrapeAt?: Date;
    }
}
