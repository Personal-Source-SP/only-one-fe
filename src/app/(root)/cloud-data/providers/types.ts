import { NCloudData } from '@/interfaces';

export interface CloudProviderFormValues {
    name: string;
    type: string;
    config?: string;
    isActive?: boolean;
}

export type CloudProviderRecord = NCloudData.ICloudDataProvider;
