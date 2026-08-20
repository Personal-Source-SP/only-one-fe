import type { CloudDataProviderType } from '@/enums';
import type { Abstract } from '@/interfaces';

export interface ICloudDataProvider extends Abstract {
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
