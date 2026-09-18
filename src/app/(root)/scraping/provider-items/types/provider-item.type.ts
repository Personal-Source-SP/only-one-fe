import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type { IAbstract } from '@/interfaces';

export interface IDataProviderItem extends IAbstract {
    itemId: string;
    itemUrl: string;
    dataProviderId: string;
    isActive: boolean;
    isSavedToCloudData: boolean;
    cloudDataProviderId?: string;
    lastScrapedTimestamp?: Date;

    // Relations
    item?: IItem;
    dataProvider?: IDataProvider;
    cloudDataProvider?: ICloudDataProvider;
}

export interface IDataProviderItemFormValues {
    itemId: string;
    dataProviderId: string;
    itemUrl: string;
    cloudDataProviderId?: string;
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
    isSavedToCloudData?: boolean;
}

export type ProviderItemFormValues = IDataProviderItemFormValues;

export type ProviderItemRecord = IDataProviderItem & {
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
};
