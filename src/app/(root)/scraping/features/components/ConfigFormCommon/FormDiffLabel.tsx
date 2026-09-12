'use client';

import { ReactNode, useMemo } from 'react';
import { CustomFlex, CustomTag } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../context';
import { getDifferenceText } from '../../utils';

export type IFormDiffLabelProps = {
    label: ReactNode;
    fieldKey: string;
    className?: string;
};

export const FormDiffLabel = ({ label, fieldKey, className }: IFormDiffLabelProps) => {
    const { feature, selectedVersion, isViewingHistory } = useFeatureModalContext();

    const diffText = useMemo(
        () =>
            getDifferenceText({
                fieldKey,
                feature,
                selectedVersion,
                isViewingHistory,
            }),
        [fieldKey, feature, selectedVersion, isViewingHistory],
    );

    if (!diffText) return <span className={className}>{label}</span>;

    return (
        <CustomFlex align="center" gap="small" className={className}>
            <span>{label}</span>
            <CustomTag color="warning" className="text-[10px] px-1.5 py-0 font-normal m-0">
                {diffText}
            </CustomTag>
        </CustomFlex>
    );
};
