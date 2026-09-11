import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';

export const FEATURE_MODAL_WIDTH = 1300;
export const FEATURE_SECTION_CONTAINER_CLASS =
    'border border-hub-border/60 bg-hub-section/20 rounded-xl p-4 sm:p-5 w-full shadow-sm';

export const SCRAPER_SERVICE_LABELS: Record<ScraperServiceEnum, string> = {
    [ScraperServiceEnum.GENERIC]: 'Trình phân tích HTML',
    [ScraperServiceEnum.API]: 'Trình thu thập API',
    [ScraperServiceEnum.LOCAL]: 'Trình thu thập thư mục cục bộ',
};

export const SCRAPER_SERVICE_OPTIONS = Object.entries(SCRAPER_SERVICE_LABELS).map(
    ([value, label]) => ({
        label,
        value: value as ScraperServiceEnum,
    }),
);

export const DEFAULT_FEATURE_TEMPLATES: Record<
    DataProviderFeatureType,
    Record<ScraperServiceEnum, string>
> = {
    [DataProviderFeatureType.SCRAPING]: {
        [ScraperServiceEnum.GENERIC]: DEFAULT_PARSER_FUNCTION_GENERATOR,
        [ScraperServiceEnum.API]: DEFAULT_API_FUNCTION_GENERATOR,
        [ScraperServiceEnum.LOCAL]: DEFAULT_PARSER_FUNCTION_GENERATOR,
    },
    [DataProviderFeatureType.SEARCH]: {
        [ScraperServiceEnum.GENERIC]: DEFAULT_SEARCH_FUNCTION_GENERATOR,
        [ScraperServiceEnum.API]: DEFAULT_SEARCH_API_FUNCTION_GENERATOR,
        [ScraperServiceEnum.LOCAL]: DEFAULT_SEARCH_FUNCTION_GENERATOR,
    },
};

export type FeatureDefinition = {
    type: DataProviderFeatureType;
    icon: string;
    label: string;
    shortLabel: string;
    accentClass: string;
    description: string;
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
        getTitle: (isDraft, providerName) =>
            `${isDraft ? 'Thiết lập' : 'Cấu hình'}: Tìm kiếm (Search)${
                providerName ? ` (${providerName})` : ''
            }`,
    },
};
