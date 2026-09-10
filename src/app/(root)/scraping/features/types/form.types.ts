import type { FormInstance } from '@/components/custom-antd';
import type { ScraperServiceEnum } from '../enums';
import type { IConfigVersion } from './config-version.types';
import type { IDataProviderFeature } from './data-provider-feature.types';
import type { ISearchTargetConfigSpecific, ITargetConfig } from './target-config.types';

export type FeatureConfigFormProps = {
    form: FormInstance;
    feature: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onClose: () => void;
    onSuccess: () => void;
    externalSetIsSaving?: (loading: boolean) => void;
};

export interface ScrapingConfigFormValues extends Omit<
    Partial<ITargetConfig>,
    'headers' | 'cookies'
> {
    service: ScraperServiceEnum;
    changeDescription?: string;
    functionGenerator?: string;
    mainContentSelector?: string;
    waitForSelector?: string;
    userAgent?: string;
    maxResults?: number;
    retryDelay?: number;
    retryAttempts?: number;
    timeout?: number;
    waitForTimeout?: number;
    isGetParentElement?: boolean;
    stealthMode?: boolean;
    cloudflareBypass?: boolean;
    javascriptEnabled?: boolean;
    imagesEnabled?: boolean;
    cssEnabled?: boolean;
    queryParams?: string;
    firstQueryParams?: string;
    headers?: string;
    cookies?: string;
}

export interface SearchConfigFormValues
    extends ScrapingConfigFormValues, Partial<ISearchTargetConfigSpecific> {
    searchUrlPattern: string;
    queryPlaceholder?: string;
    resultSelector?: string;
}

export interface TestInputFormValues {
    testUrl?: string;
    testQuery?: string;
    htmlContentString?: string;
}

export interface FeatureTestResult {
    html?: string;
    error?: string;
    data?: Array<Record<string, unknown>> | Record<string, unknown>;
    [key: string]: unknown;
}
