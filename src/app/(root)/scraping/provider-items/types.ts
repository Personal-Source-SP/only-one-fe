import { NDataProvider } from '@/interfaces';

export interface ProviderItemFormValues {
    itemId: string;
    dataProviderId: string;
    itemUrl: string;
    cloudDataProviderId?: string;
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
    isSavedToCloudData?: boolean;
}

export type ProviderItemRecord = NDataProvider.IDataProviderItem & {
    autoProcessScraping?: boolean;
    checkDuplicateData?: boolean;
};
