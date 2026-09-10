'use client';

import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, DEFAULT_SEARCH_TARGET_CONFIG } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { useFeatureConfigForm } from '../../hooks';
import type { FeatureConfigFormProps, SearchConfigFormValues } from '../../types';
import {
    FeatureAdvancedSection,
    FeatureChangeLogSection,
    FeatureCodeSection,
    FeatureLimitsSection,
} from '../ConfigFormCommon';
import { SearchSelectorsSection } from './SearchSelectorsSection';
import { SearchUrlPatternSection } from './SearchUrlPatternSection';

export const SearchConfigTab = ({
    feature,
    form,
    selectedVersion,
    isViewingHistory,
    onClose,
    onSuccess,
}: FeatureConfigFormProps) => {
    const headers = CustomForm.useWatch('headers', form);
    const cookies = CustomForm.useWatch('cookies', form);
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const currentService = CustomForm.useWatch('service', form) || ScraperServiceEnum.GENERIC;

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
                <SearchUrlPatternSection
                    service={currentService}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onServiceChange={handleServiceChange}
                />

                {hasSearchSelectors && (
                    <SearchSelectorsSection
                        service={currentService}
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                )}

                <FeatureLimitsSection
                    service={currentService}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                {(hasBrowserSettings || hasAdvancedHeaders) && (
                    <FeatureAdvancedSection
                        form={form}
                        service={currentService}
                        headers={headers}
                        cookies={cookies}
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                )}

                <FeatureCodeSection
                    form={form}
                    service={currentService}
                    functionGenerator={functionGenerator}
                    feature={feature}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                />

                <FeatureChangeLogSection feature={feature} isViewingHistory={isViewingHistory} />
            </CustomFlex>
        </CustomForm>
    );
};
