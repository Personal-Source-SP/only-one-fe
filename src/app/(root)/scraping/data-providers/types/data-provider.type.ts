import type { IDataProviderFeature } from '@/app/(root)/scraping/features/types';
import type { IDataProviderItem } from '@/app/(root)/scraping/provider-items/types';
import type { IScrapingData } from '@/app/(root)/scraping/scraping-data/types';
import type { IAbstract } from '@/interfaces';

export interface IDataProvider extends IAbstract {
    name: string;
    baseUrl: string;
    identifier: string;

    // Relations
    scrapingData?: IScrapingData[];
    features?: IDataProviderFeature[];
    dataProviderItems?: IDataProviderItem[];
}

export interface IDataProviderFormValues {
    name: string;
    baseUrl: string;
    identifier: string;
}
