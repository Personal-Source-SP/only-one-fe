import type { ComponentType } from 'react';
import { DataProviderFeatureType } from '@/enums';
import { ScrapingConfigForm } from '@/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm';
import { SearchConfigForm } from '@/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm';
import type { IDataProviderFeature } from '@/app/(root)/scraping/features/[dataProviderId]/types';

export type FeatureConfigFormProps = {
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
};

export type FeatureDefinition = {
    type: DataProviderFeatureType;
    label: string;
    shortLabel: string;
    icon: string;
    accentClass: string;
    description: string;
    ConfigComponent: ComponentType<FeatureConfigFormProps>;
    getTitle: (isDraft: boolean, providerName?: string) => string;
};

export const FEATURE_REGISTRY: Record<DataProviderFeatureType, FeatureDefinition> = {
    [DataProviderFeatureType.SCRAPING]: {
        type: DataProviderFeatureType.SCRAPING,
        label: 'Cào dữ liệu (Scraping)',
        shortLabel: 'Scraping',
        icon: 'lucide:bot',
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
        label: 'Tìm kiếm (Search)',
        shortLabel: 'Search',
        icon: 'lucide:search',
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

export const getFeatureDefinition = (
    type: DataProviderFeatureType,
): FeatureDefinition | undefined => {
    return FEATURE_REGISTRY[type];
};
