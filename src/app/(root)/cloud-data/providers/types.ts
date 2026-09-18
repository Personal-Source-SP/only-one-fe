import type { CloudDataProviderType } from './enums';
import type { IAbstract } from '@/interfaces';

export interface ICloudDataProvider extends IAbstract {
    name: string;
    type: CloudDataProviderType;
    isActive: boolean;
    totalItems: number;
    totalSize: number;
    config?: Record<string, unknown>;
}

export interface CloudProviderFormValues {
    name: string;
    type: string;
    config?: string;
    isActive?: boolean;
}

export type CloudProviderRecord = ICloudDataProvider;
