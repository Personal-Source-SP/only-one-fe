import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { DataProviderFeatureStatus, DataProviderFeatureType } from '@/enums';
import type { Abstract } from '@/interfaces';

export interface IConfigVersion extends Abstract {
    featureId: string;
    versionId: number;
    service?: string;
    config: Record<string, any>;
    changeType?: string;
    changeDescription?: string;
    isActive: boolean;
    createdBy?: string;
}

export interface IDataProviderFeature extends Abstract {
    dataProviderId: string;
    type: DataProviderFeatureType;
    service: string;
    status: DataProviderFeatureStatus;
    config?: Record<string, any>;
    consecutiveFailures: number;
    lastErrorMessage?: string;
    lastErrorType?: string;
    lastFailedRunAt?: Date;
    lastSuccessfulRunAt?: Date;
    versions?: IConfigVersion[];
    dataProvider?: IDataProvider;
}

export interface CreateDataProviderFeatureRequest {
    type: DataProviderFeatureType;
    service?: string;
    config?: Record<string, any>;
}

export interface UpdateFeatureConfigRequest {
    config: Record<string, any>;
    service?: string;
    changeDescription?: string;
}

export interface TestFeatureStatelessRequest {
    type: DataProviderFeatureType;
    service?: string;
    config: Record<string, any>;
    input?: Record<string, any>;
}

export interface TestFeatureContextualRequest {
    input?: Record<string, any>;
}

export type FeatureModalTab = 'config' | 'test' | 'versions';

export interface FeatureModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
    activeTab: FeatureModalTab;
}
