import type { IUser } from '@/app/(root)/setting/users/types';
import type { Abstract } from '@/interfaces';
import type { ConfigVersionType } from '../enums';
import type { IDataProviderFeature } from './data-provider-feature.types';

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

export interface HistoryModalState {
    open: boolean;
    feature: IDataProviderFeature | null;
}
