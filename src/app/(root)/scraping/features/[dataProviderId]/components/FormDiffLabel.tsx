'use client';

import React from 'react';
import { CustomFlex, CustomTag } from '@/components/custom-antd';
import { ScraperServiceEnum } from '@/enums';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export type FormDiffLabelProps = {
    label: string;
    fieldKey: string;
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

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

export const FormDiffLabel: React.FC<FormDiffLabelProps> = ({
    label,
    fieldKey,
    isViewingHistory,
    feature,
    selectedVersion,
}) => {
    const diffText = getDifferenceText(fieldKey, isViewingHistory, feature, selectedVersion);
    if (!diffText) return <>{label}</>;

    return (
        <CustomFlex align="center" gap="small">
            <span>{label}</span>
            <CustomTag color="warning" className="text-[10px] px-1.5 py-0 font-normal m-0">
                {diffText}
            </CustomTag>
        </CustomFlex>
    );
};
