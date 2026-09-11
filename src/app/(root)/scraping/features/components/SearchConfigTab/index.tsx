'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { useFeatureConfigForm } from '../../hooks';
import type { SearchConfigFormValues } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export const SearchConfigTab = () => {
    const { form, currentService } = useFeatureModalContext();

    const { hasSearchSelectors, hasBrowserSettings, hasAdvancedHeaders } =
        checkService(currentService);

    const { handleServiceChange, handleSave } = useFeatureConfigForm<SearchConfigFormValues>({
        featureLabel: 'tìm kiếm',
        defaultTargetConfig: DEFAULT_SEARCH_TARGET_CONFIG,
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
