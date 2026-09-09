import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IItem } from '@/app/(root)/scraping/items/types';
import type { LocalFolderRegistrationStatusEnum } from './enums';
import type { Abstract } from '@/interfaces';

export interface IDataProviderItem extends Abstract {
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

export interface ILocalFolderSelection {
    name: string;
    itemUrl: string;
    identifier: string;
    path?: string;
}

export interface CreateLocalFolderItemRequest {
    code: string;
    name: string;
}

export interface CreateLocalFolderProviderItemRequest {
    itemId: string;
    itemUrl: string;
    dataProviderId: string;
}

export interface RegisterLocalFolderRequest {
    itemUrl: string;
    itemCode: string;
    itemName: string;
    folderName: string;
    folderPath?: string;
    dataProviderId: string;
    folderIdentifier: string;
}

export interface RegisterLocalFolderResponse {
    itemId: string;
    itemUrl: string;
    itemStatus: LocalFolderRegistrationStatusEnum;
    dataProviderItemId: string;
}

export interface IImportDataProvider {
    itemName: string;
    itemCode: string;
    itemUrl: string;
    dataProviderIdentifier: string;
    itemId?: string;
    dataProviderId?: string;
    dataProviderName?: string;
}

export interface ProviderItemFormValues {
    itemId: string;
    dataProviderId: string;
    itemUrl: string;
    cloudDataProviderId?: string;
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
    isSavedToCloudData?: boolean;
}

export type ProviderItemRecord = IDataProviderItem & {
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
};
