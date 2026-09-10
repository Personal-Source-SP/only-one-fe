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

export interface UseFeatureConfigFormOptions<TValues extends ScrapingConfigFormValues> {
    feature: IDataProviderFeature;
    form: FormInstance;
    selectedVersion?: IConfigVersion | null;
    featureLabel?: string;
    defaultTargetConfig?: Record<string, unknown>;
    onClose: () => void;
    onSuccess: () => void;
    externalSetIsSaving?: (loading: boolean) => void;
    extraInitialValues?: (config: Record<string, any>) => Partial<TValues>;
    getDefaultTemplate?: (service: ScraperServiceEnum) => string;
}

export interface UseFeatureConfigFormReturn<TValues extends ScrapingConfigFormValues> {
    isSaving: boolean;
    isDraft: boolean;
    handleSave: (values: TValues) => Promise<void>;
    handleServiceChange: (service: ScraperServiceEnum) => void;
}

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

export interface FeatureTestResult {
    html?: string;
    error?: string;
    data?: Array<Record<string, unknown>> | Record<string, unknown>;
    [key: string]: unknown;
}
