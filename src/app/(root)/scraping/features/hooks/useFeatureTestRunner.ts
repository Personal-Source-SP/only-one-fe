'use client';

import { useCallback, useMemo, useState } from 'react';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';

import type { FormInstance } from '@/components/custom-antd';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FeatureTestResult, IDataProviderFeature, TestInputFormValues } from '../types';

export type UseFeatureTestRunnerProps = {
    feature: IDataProviderFeature;
    configForm?: FormInstance;
};

export const useFeatureTestRunner = ({ feature, configForm }: UseFeatureTestRunnerProps) => {
    const [testResult, setTestResult] = useState<FeatureTestResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);

    const { handleCustomMutationData } = useCustomMutationData();

    const isScraping = useMemo(
        () => feature.type === DataProviderFeatureType.SCRAPING,
        [feature.type],
    );

    const handleRunTest = useCallback(
        async (values: TestInputFormValues): Promise<void> => {
            setIsLoading(true);
            setErrorMessage(null);

            const currentFormValues = configForm ? configForm.getFieldsValue() : {};
            const activeService =
                currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;

            const isGeneric = activeService === ScraperServiceEnum.GENERIC;

            const inputPayload: Record<string, unknown> = {};
            if (isScraping) {
                inputPayload.url = values.testUrl;

                if (isGeneric && isTestHtmlContent) {
                    inputPayload.htmlContentString = values.htmlContentString;
                }
            } else {
                if (values.testQuery) {
                    inputPayload.query = values.testQuery;
                }

                if (isGeneric && isTestHtmlContent) {
                    inputPayload.htmlContentString = values.htmlContentString;
                }
            }

            const { service: _s, changeDescription: _cd, ...configData } = currentFormValues;
            const configPayload =
                Object.keys(configData).length > 0 ? configData : feature.config || {};

            handleCustomMutationData({
                method: 'post',
                url: 'data-provider-features/test',
                values: {
                    type: feature.type,
                    service: activeService,
                    config: configPayload,
                    input: inputPayload,
                },
                successNotification: (res) => {
                    const data = (res?.data?.data || res?.data) as FeatureTestResult;
                    setTestResult(data);
                    setIsLoading(false);

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm thành công',
                    };
                },
                errorNotification: (err) => {
                    setIsLoading(false);
                    setErrorMessage(err?.message || 'Đã xảy ra lỗi khi thử nghiệm');

                    return {
                        type: MessageType.ERROR,
                        message: 'Thử nghiệm thất bại',
                        description: err?.message,
                    };
                },
            });
        },
        [isScraping, isTestHtmlContent, feature, configForm, handleCustomMutationData],
    );

    return {
        isScraping,
        testResult,
        isLoading,
        errorMessage,
        isTestHtmlContent,
        setIsTestHtmlContent,
        handleRunTest,
        setTestResult,
    };
};
