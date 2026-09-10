import { ScraperServiceEnum } from '../enums';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export const getDifferenceText = (
    fieldKey: string,
    isViewingHistory?: boolean,
    feature?: IDataProviderFeature,
    selectedVersion?: IConfigVersion | null,
): string | null => {
    if (!isViewingHistory || !feature) return null;

    if (fieldKey === 'service') {
        const currentService = feature.service || ScraperServiceEnum.GENERIC;
        const snapshotService = selectedVersion?.config?.service || ScraperServiceEnum.GENERIC;
        return currentService !== snapshotService ? `Hiện tại: ${currentService}` : null;
    }

    const currentConfig = (feature.config || {}) as Record<string, any>;
    const snapshotConfig = (selectedVersion?.config || {}) as Record<string, any>;

    const currentVal = currentConfig[fieldKey];
    const snapshotVal = snapshotConfig[fieldKey];

    if (currentVal === snapshotVal) return null;

    if (typeof currentVal === 'boolean' || typeof snapshotVal === 'boolean') {
        return Boolean(currentVal) !== Boolean(snapshotVal)
            ? currentVal
                ? 'Hiện tại: Bật'
                : 'Hiện tại: Tắt'
            : null;
    }

    if (currentVal === undefined && snapshotVal === undefined) return null;

    return currentVal ? `Hiện tại: ${currentVal}` : 'Hiện tại: Trống';
};
