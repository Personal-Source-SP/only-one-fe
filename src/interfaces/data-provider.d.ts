import {
    DataProviderSearchStatus,
    DataProviderStatus,
    LocalFolderRegistrationStatusEnum,
    ProductMappingStatus,
} from '@/enums';
import { Abstract } from '@/interfaces';
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

    interface ILocalFolderSelection {
        name: string;
        itemUrl: string;
        identifier: string;
        path?: string;
    }

    interface CreateLocalFolderItemRequest {
        code: string;
        name: string;
    }

    interface CreateLocalFolderProviderItemRequest {
        itemId: string;
        itemUrl: string;
        dataProviderId: string;
    }

    interface RegisterLocalFolderRequest {
        itemUrl: string;
        itemCode: string;
        itemName: string;
        folderName: string;
        folderPath?: string;
        dataProviderId: string;
        folderIdentifier: string;
    }

    interface RegisterLocalFolderResponse {
        itemId: string;
        itemUrl: string;
        itemStatus: LocalFolderRegistrationStatusEnum;
        dataProviderItemId: string;
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
        searchService: string;
        searchStatus: DataProviderSearchStatus;
        dataProviderItems?: IDataProviderItem[];
    }

    interface IDataProviderItem extends Abstract {
        itemId: string;
        itemUrl: string;
        dataProviderId: string;
        isActive: boolean;
        isSavedToCloudData: boolean;
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
        metadata?: Record<string, unknown>;
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
            data: Record<string, unknown>;
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
