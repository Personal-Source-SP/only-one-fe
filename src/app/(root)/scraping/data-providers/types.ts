import type { NDataProvider } from '@/interfaces';

export interface DataProviderFormValues {
    name: string;
    identifier: string;
    baseUrl: string;
}

export type DataProviderRecord = NDataProvider.IDataProvider;
export type ImportDataProviderRecord = NDataProvider.IImportDataProvider;

export type SettingConfigType = 'target' | 'search';
