'use client';

import { type ReactNode } from 'react';
import { CustomFlex, CustomTag } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../context';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { getDifferenceText } from '../../utils';

export interface IFormDiffLabelProps {
    label: ReactNode;
    fieldKey: string;
    isViewingHistory?: boolean;
    feature?: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
}

export const FormDiffLabel = ({
    label,
    fieldKey,
    isViewingHistory,
    feature,
    selectedVersion,
}: IFormDiffLabelProps) => {
    const context = useFeatureModalContext();
    const activeFeature = feature ?? context.feature;
    const activeSelectedVersion =
        selectedVersion !== undefined ? selectedVersion : context.selectedVersion;
    const activeIsViewingHistory =
        isViewingHistory !== undefined ? isViewingHistory : context.isViewingHistory;

    const diffText = getDifferenceText({
        fieldKey,
        isViewingHistory: activeIsViewingHistory,
        feature: activeFeature,
        selectedVersion: activeSelectedVersion,
    });
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
