import type { IUser } from '@/app/(root)/setting/users/types';
import type { Abstract } from '@/interfaces';
import type { ConfigVersionType } from '../enums';
import type { IDataProviderFeature } from './data-provider-feature.types';
import type { TargetConfig } from './target-config.types';

export interface IConfigVersion<TConfig extends TargetConfig = TargetConfig> extends Abstract {
    featureId: string;
    isActive: boolean;
    versionId: number;
    config: TConfig;
    changeType: ConfigVersionType;
    changeDescription?: string;

    user?: IUser;
    feature?: IDataProviderFeature<TConfig>;
}

export interface HistoryModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
}
