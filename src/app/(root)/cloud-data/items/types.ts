import { NCloudData } from '@/interfaces';

export interface CloudItemFormValues {
    cloudDataProviderId: string;
    file?: any;
}

export type CloudItemRecord = NCloudData.ICloudDataItem;
