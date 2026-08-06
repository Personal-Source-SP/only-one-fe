import { NDataProvider } from '@/interfaces';

export interface ItemFormValues {
    name: string;
    code: string;
    tags?: string;
}

export type ItemRecord = NDataProvider.IItem;
export type ImportItemRecord = NDataProvider.IItem;
