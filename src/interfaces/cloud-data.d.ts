import { CloudDataProviderType } from '@/enums';
import { Abstract } from '@/interfaces/common';

export declare namespace NCloudData {
    interface ICloudDataItem extends Abstract {
        cloudDataProviderId: string;
        isActive: boolean;
        pathId: string;
        pathUrl: string;
        fileName?: string;
        mimeType?: string;
        fileSize?: number;
        mappingId?: string;
        metadata?: Record<string, any>;
    }

    interface ICloudDataProvider extends Abstract {
        name: string;
        type: CloudDataProviderType;
        isActive: boolean;
        totalItems: number;
        totalSize: number;
        config?: Record<string, any>;
        cloudDataItems?: ICloudDataItem[];
    }
}
