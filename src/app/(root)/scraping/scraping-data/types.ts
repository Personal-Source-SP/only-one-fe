import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { MimeType } from '@/enums';
import type { Abstract } from '@/interfaces';

export interface IScrapingData extends Abstract {
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

export interface IScrapeDataResponse {
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

export interface IScrapeDataRequest {
    checkDuplicateData: boolean;
    mimeTypes?: MimeType[];
    itemIds?: string[];
    dataProviderItemIds?: string[];
    lastSuccessfulScrapeAt?: Date;
}

export interface IPreviewImportDataResponse {
    statistics?: {
        errors: number;
        updates: number;
        overridden: number;
    };
    data: Record<string, any>[];
}

export interface IImportDataResponse {
    success: boolean;
    message: string;
    updated: number;
    validationErrorMessages?: string[];
}

export type ScrapingDataRecord = IScrapingData;
