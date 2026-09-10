import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { Abstract } from '@/interfaces';
import type {
    DataProviderFeatureErrorType,
    DataProviderFeatureStatus,
    DataProviderFeatureType,
    ScraperServiceEnum,
} from '../enums';
import type { IConfigVersion } from './config-version.types';
import type { ISearchTargetConfig, ITargetConfig } from './target-config.types';

export interface IDataProviderFeature extends Abstract {
    dataProviderId: string;
    type: DataProviderFeatureType;
    service: ScraperServiceEnum;
    status: DataProviderFeatureStatus;
    consecutiveFailures: number;

    config?: Record<string, any>;
    lastErrorMessage?: string;
    lastErrorType?: DataProviderFeatureErrorType;
    lastFailedRunAt?: Date;
    lastSuccessfulRunAt?: Date;
    dataProvider?: IDataProvider;
    versions?: IConfigVersion[];
}

export interface CreateDataProviderFeatureRequest {
    type: DataProviderFeatureType;
    service: ScraperServiceEnum;
    config?: Record<string, any>;
    input?: Record<string, any>;
}

export interface UpdateFeatureConfigRequest {
    changeDescription: string;
    config?: Record<string, any>;
    input?: Record<string, any>;
}

export interface TestFeatureStatelessRequest {
    type: DataProviderFeatureType;
    config: Record<string, any>;
    service?: ScraperServiceEnum;
    input?: Record<string, any>;
}

export type FeatureModalTab = 'config' | 'test';

export interface FeatureModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
    activeTab: FeatureModalTab;
}
