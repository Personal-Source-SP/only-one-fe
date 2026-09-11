import { DataProviderFeatureType } from '../enums';
import type { FormEvaluationContext, FormSectionSchema } from '../types';
import { getDefaultFormValuesFromSections } from '../utils';
import { SCRAPING_FORM_SECTIONS } from './scraping-config.constants';
import { SEARCH_FORM_SECTIONS } from './search-config.constants';

export const FEATURE_FORM_SECTIONS: Record<DataProviderFeatureType, FormSectionSchema[]> = {
    [DataProviderFeatureType.SCRAPING]: SCRAPING_FORM_SECTIONS,
    [DataProviderFeatureType.SEARCH]: SEARCH_FORM_SECTIONS,
};

export const getFeatureFormSections = (featureType: DataProviderFeatureType): FormSectionSchema[] =>
    FEATURE_FORM_SECTIONS[featureType] || [];

export const getDefaultFormValues = (context: FormEvaluationContext): Record<string, unknown> => {
    const sections = getFeatureFormSections(context.featureType);
    return getDefaultFormValuesFromSections(sections, context);
};
