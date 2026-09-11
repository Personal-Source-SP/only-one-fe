'use client';

import { ScraperServiceEnum } from '../enums';
import { useFeatureModalContext } from '../context';

export const useCurrentService = (): ScraperServiceEnum => {
    const { currentService } = useFeatureModalContext();
    return currentService;
};
