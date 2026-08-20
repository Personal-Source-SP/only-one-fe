import type { Abstract } from '@/interfaces';
import type { ICloudDataProvider } from '@/app/(root)/cloud-data/providers/types';

export interface ICloudDataItem extends Abstract {
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

export interface CloudItemFormValues {
    cloudDataProviderId: string;
    file?: any;
}

export type CloudItemRecord = ICloudDataItem;
