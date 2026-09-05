import type { ProductMappingStatus } from './enums';
import type { Abstract } from '@/interfaces';

export interface IItem extends Abstract {
    name: string;
    mappingStatus: ProductMappingStatus;
    code?: string;
    tags?: string[];
}

export interface ItemFormValues {
    name: string;
    code: string;
    tags?: string;
}

export type ItemRecord = IItem;
export type ImportItemRecord = IItem;
