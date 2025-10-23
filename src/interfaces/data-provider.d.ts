import {
    DataProviderSearchStatus,
    DataProviderStatus,
    ProductMappingStatus,
    ScrapeStatusEnum,
} from '@/enums';
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
        mainContentSelector: string;
        isGetParentElement: boolean;
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
        lastFailedScrapeAt?: Date;
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
        lastScrapeStatus?: ScrapeStatusEnum;
        lastScrapedTimestamp?: Date;
        item: IItem;
        dataProvider: IDataProvider;
    }

    interface IDataHistory extends Abstract {
        dataProviderItemId: string;
        scrapeTimestamp: Date;
        status: ScrapeStatusEnum;
        metadata?: Record<string, any>;
        errorMessage?: string;
        dataProviderItem?: IDataProviderItem;
    }
}
