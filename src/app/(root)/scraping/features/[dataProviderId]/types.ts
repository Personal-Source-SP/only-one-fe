import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import type { IUser } from '@/app/(root)/setting/users/types';
import type {
    ConfigVersionType,
    DataProviderFeatureErrorType,
    DataProviderFeatureStatus,
    DataProviderFeatureType,
} from './enums';
import type { Abstract } from '@/interfaces';

export interface IConfigVersion extends Abstract {
    featureId: string;
    isActive: boolean;
    versionId: number;
    config: Record<string, any>;
    changeType: ConfigVersionType;
    changeDescription?: string;
    createdBy?: string;
    user?: IUser;
    feature?: IDataProviderFeature;
}

export interface IDataProviderFeature extends Abstract {
    dataProviderId: string;
    type: DataProviderFeatureType;
    service: string;
    status: DataProviderFeatureStatus;
    config?: Record<string, any>;
    consecutiveFailures: number;
    lastErrorMessage?: string;
    lastErrorType?: DataProviderFeatureErrorType;
    lastFailedRunAt?: Date;
    lastSuccessfulRunAt?: Date;
    dataProvider?: IDataProvider;
    versions?: IConfigVersion[];
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

export type FeatureModalTab = 'config' | 'test';

export interface FeatureModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
    activeTab: FeatureModalTab;
}

export interface HistoryModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
}
