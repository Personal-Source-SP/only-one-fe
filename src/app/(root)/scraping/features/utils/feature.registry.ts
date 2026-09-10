import type { ComponentType } from 'react';
import { ScrapingConfigForm, SearchConfigForm } from '../components';
import { DataProviderFeatureType } from '../enums';
import type { FeatureConfigFormProps } from '../types';

export type FeatureDefinition = {
    type: DataProviderFeatureType;
    icon: string;
    label: string;
    shortLabel: string;
    accentClass: string;
    description: string;
    ConfigComponent: ComponentType<FeatureConfigFormProps>;
    getTitle: (isDraft: boolean, providerName?: string) => string;
};

export const FEATURE_REGISTRY: Record<DataProviderFeatureType, FeatureDefinition> = {
    [DataProviderFeatureType.SCRAPING]: {
        type: DataProviderFeatureType.SCRAPING,
        icon: 'lucide:bot',
        label: 'Cào dữ liệu (Scraping)',
        shortLabel: 'Scraping',
        accentClass: 'text-emerald-500 bg-emerald-500/10',
        description: 'Cào dữ liệu tự động từ nhà cung cấp',
        ConfigComponent: ScrapingConfigForm,
        getTitle: (isDraft, providerName) =>
            `${isDraft ? 'Thiết lập' : 'Cấu hình'}: Cào dữ liệu (Scraping)${
                providerName ? ` (${providerName})` : ''
            }`,
    },
    [DataProviderFeatureType.SEARCH]: {
        type: DataProviderFeatureType.SEARCH,
        icon: 'lucide:search',
        label: 'Tìm kiếm (Search)',
        shortLabel: 'Search',
        accentClass: 'text-indigo-500 bg-indigo-500/10',
        description: 'Tìm kiếm sản phẩm từ nhà cung cấp',
        ConfigComponent: SearchConfigForm,
        getTitle: (isDraft, providerName) =>
            `${isDraft ? 'Thiết lập' : 'Cấu hình'}: Tìm kiếm (Search)${
                providerName ? ` (${providerName})` : ''
            }`,
    },
};

export const FEATURE_TYPE_METADATA = FEATURE_REGISTRY;
export const getFeatureDefinition = (type: DataProviderFeatureType) => FEATURE_REGISTRY[type];
