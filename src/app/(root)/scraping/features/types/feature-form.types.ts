import type { ScraperServiceEnum } from '../enums';
import type { ISearchTargetConfigSpecific, ITargetConfig } from './target-config.types';

export interface ScrapingConfigFormValues extends Omit<
    Partial<ITargetConfig>,
    'headers' | 'cookies' | 'service'
> {
    service: ScraperServiceEnum;
    changeDescription?: string;
    headers?: string;
    cookies?: string;
}

export interface SearchConfigFormValues
    extends
        ScrapingConfigFormValues,
        Omit<Partial<ISearchTargetConfigSpecific>, 'searchUrlPattern'> {
    searchUrlPattern: string;
}

export interface TestInputFormValues {
    testUrl?: string;
    testQuery?: string;
    htmlContentString?: string;
}
