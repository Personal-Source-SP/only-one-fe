import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { Abstract } from '@/interfaces';
import type {
    DataProviderFeatureErrorType,
    DataProviderFeatureStatus,
    DataProviderFeatureType,
    ScraperServiceEnum,
} from '../enums';
import type { IConfigVersion } from './config-version.types';
import type { TargetConfig } from './target-config.types';

export interface IDataProviderFeature<
    TConfig extends TargetConfig = TargetConfig,
> extends Abstract {
    dataProviderId: string;
    type: DataProviderFeatureType;
    service: ScraperServiceEnum;
    status: DataProviderFeatureStatus;
    consecutiveFailures: number;

    config?: TConfig;
    lastErrorMessage?: string;
    lastErrorType?: DataProviderFeatureErrorType;
    lastFailedRunAt?: Date;
    lastSuccessfulRunAt?: Date;

    dataProvider?: IDataProvider;
    versions?: IConfigVersion<TConfig>[];
}

export type FeatureModalTab = 'config' | 'test';

export interface FeatureModalState {
    open: boolean;
    activeTab: FeatureModalTab;
    feature: IDataProviderFeature | null;
}
