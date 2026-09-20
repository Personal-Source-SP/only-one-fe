import type { IAbstract } from '@/interfaces';

import type { CloudDataProviderType } from '../enums';

export interface ICloudDataProvider extends IAbstract {
    name: string;
    type: CloudDataProviderType;
    isActive: boolean;
    totalItems: number;
    totalSize: number;
    config?: Record<string, unknown>;
}

export interface ICloudDataProviderFormValues {
    name: string;
    type: string;
    config?: string;
    isActive?: boolean;
}

export type CloudProviderFormValues = ICloudDataProviderFormValues;
export type CloudProviderRecord = ICloudDataProvider;
