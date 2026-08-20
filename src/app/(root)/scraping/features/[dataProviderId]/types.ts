import type { DataProviderFeatureType } from '@/enums';
import type { NDataProvider } from '@/interfaces';

export type FeatureModalTab = 'config' | 'test' | 'versions';

export interface FeatureModalState {
    open: boolean;
    feature: NDataProvider.IDataProviderFeature | null;
    activeTab: FeatureModalTab;
}

export interface CreateFeatureModalState {
    open: boolean;
    availableTypes: DataProviderFeatureType[];
}
