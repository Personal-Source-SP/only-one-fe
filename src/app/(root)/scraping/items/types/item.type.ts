import type { IAbstract } from '@/interfaces';

import type { ProductMappingStatus } from '../enums';

export interface IItem extends IAbstract {
    name: string;
    mappingStatus: ProductMappingStatus;
    code?: string;
    tags?: string[];
}

export interface IItemFormValues {
    name: string;
    code: string;
    tags?: string;
}
