'use client';

import { type ReactNode } from 'react';
import { CustomFlex, CustomTag } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../context';
import { getDifferenceText } from '../../utils';

export interface IFormDiffLabelProps {
    label: ReactNode;
    fieldKey: string;
}

export const FormDiffLabel = ({ label, fieldKey }: IFormDiffLabelProps) => {
    const { feature, selectedVersion, isViewingHistory } = useFeatureModalContext();

    const diffText = getDifferenceText({
        fieldKey,
        feature,
        selectedVersion,
        isViewingHistory,
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
