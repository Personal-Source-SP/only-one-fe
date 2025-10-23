import { ProductMappingStatus } from '@/enums';
import { IAbstract } from '@/interfaces/common';

export declare namespace NDataProvider {
    interface IItem extends IAbstract {
        name: string;
        mappingStatus: ProductMappingStatus;
        code?: string;
        tags?: string[];
    }
}
