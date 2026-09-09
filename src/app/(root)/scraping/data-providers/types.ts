import type { IDataProviderFeature } from '@/app/(root)/scraping/features/[dataProviderId]/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { IScrapingData } from '@/app/(root)/scraping/scraping-data/types';
import type { Abstract } from '@/interfaces';

export interface IDataProvider extends Abstract {
    identifier: string;
    name: string;
    baseUrl: string;

    // Relations
    scrapingData?: IScrapingData[];
    features?: IDataProviderFeature[];
    dataProviderItems?: IDataProviderItem[];
}

export interface DataProviderFormValues {
    name: string;
    baseUrl: string;
    identifier: string;
}
