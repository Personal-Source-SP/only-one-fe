'use client';

import React from 'react';
import { CustomFlex, CustomTag } from '@/components/custom-antd';
import type { IConfigVersion, IDataProviderFeature } from '../types';
import { getDifferenceText } from '../utils';

export type FormDiffLabelProps = {
    label: string;
    fieldKey: string;
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
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
