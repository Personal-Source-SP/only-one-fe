'use client';

import { CustomForm } from '@/components/custom-antd';
import { ScraperServiceEnum } from '../enums';
import { useFeatureModalContext } from '../context';

export const useCurrentService = (): ScraperServiceEnum => {
    const { form, selectedVersion, feature } = useFeatureModalContext();
    const formService = CustomForm.useWatch('service', form);

    return (
        formService ||
        selectedVersion?.config?.service ||
        feature?.service ||
        ScraperServiceEnum.GENERIC
    );
};
