import type { IDataProviderFeature } from '@/app/(root)/scraping/features/[dataProviderId]/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { IScrapingData } from '@/app/(root)/scraping/scraping-data/types';
import type { Abstract } from '@/interfaces';

export interface IDataProvider extends Abstract {
    identifier: string;
    name: string;
    baseUrl: string;
    features?: IDataProviderFeature[];
    dataProviderItems?: IDataProviderItem[];
    scrapingData?: IScrapingData[];
}

export interface DataProviderFormValues {
    name: string;
    baseUrl: string;
    identifier: string;
}
