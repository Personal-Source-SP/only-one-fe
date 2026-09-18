import type { IAbstract } from '@/interfaces';
import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';

export interface ICloudDataItem extends IAbstract {
    cloudDataProviderId: string;
    isActive: boolean;
    pathId: string;
    pathUrl: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    mappingId?: string;
    metadata?: Record<string, unknown>;
    cloudDataProvider?: ICloudDataProvider;
}

export interface ICloudDataItemFormValues {
    cloudDataProviderId: string;
    file?: unknown;
}

export type CloudDataItemFormValues = ICloudDataItemFormValues;
export type CloudItemFormValues = ICloudDataItemFormValues;
export type CloudItemRecord = ICloudDataItem;
