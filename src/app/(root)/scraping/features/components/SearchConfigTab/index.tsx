'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { useCurrentService, useFeatureConfigForm } from '../../hooks';
import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export const SearchConfigTab = ({
    feature: propFeature,
    form: propForm,
    selectedVersion: propSelectedVersion,
    onClose: propOnClose,
    onSuccess: propOnSuccess,
    onSaveForm: propOnSaveForm,
}: FeatureConfigFormProps) => {
    const context = useFeatureModalContext();
    const feature = propFeature ?? context.feature;
    const form = propForm ?? context.form;
    const selectedVersion =
        propSelectedVersion !== undefined ? propSelectedVersion : context.selectedVersion;
    const onClose = propOnClose ?? context.onClose;
    const onSuccess = propOnSuccess ?? context.onSuccess;
    const onSaveForm = propOnSaveForm ?? context.onSaveForm;

    const currentService = useCurrentService();

    const { hasSearchSelectors, hasBrowserSettings, hasAdvancedHeaders } =
        checkService(currentService);

    const { handleServiceChange, handleSave } = useFeatureConfigForm<SearchConfigFormValues>({
        feature,
        form,
        selectedVersion,
        featureLabel: 'tìm kiếm',
        defaultTargetConfig: DEFAULT_SEARCH_TARGET_CONFIG,
        onClose,
        onSuccess,
        onSaveForm,
        getDefaultTemplate: (service) => checkService(service).defaultSearchTemplate,
        extraInitialValues: (config) => ({
            searchUrlPattern: config.searchUrlPattern || '',
            queryPlaceholder:
                config.queryPlaceholder || DEFAULT_SEARCH_TARGET_CONFIG.queryPlaceholder,
            resultSelector: config.resultSelector || '',
        }),
    });

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                <SearchUrlPatternSection onServiceChange={handleServiceChange} />

                {hasSearchSelectors && <SearchSelectorsSection />}

                <FeatureLimitsSection />

                {(hasBrowserSettings || hasAdvancedHeaders) && <FeatureAdvancedSection />}

                <FeatureCodeSection />
            </CustomFlex>
        </CustomForm>
    );
};
