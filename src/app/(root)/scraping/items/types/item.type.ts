import type { ProductMappingStatus } from '../enums';
import type { IAbstract } from '@/interfaces';

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

export type ItemRecord = IItem;
export type ImportItemRecord = IItem;
export type ItemFormValues = IItemFormValues;
