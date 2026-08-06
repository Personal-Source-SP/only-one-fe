import { NDataProvider } from '@/interfaces';

export interface DataProviderFormValues {
    name: string;
    identifier: string;
    baseUrl: string;
    parentId?: string;
}

export type DataProviderRecord = NDataProvider.IDataProvider;
export type ImportDataProviderRecord = NDataProvider.IImportDataProvider;
