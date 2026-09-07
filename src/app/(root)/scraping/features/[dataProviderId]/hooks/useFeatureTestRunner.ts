'use client';

import { useCallback, useMemo, useState } from 'react';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';

import type { FormInstance } from '@/components/custom-antd';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { IDataProviderFeature } from '../types';

export type UseFeatureTestRunnerProps = {
    feature: IDataProviderFeature;
    configForm?: FormInstance;
};

export const useFeatureTestRunner = ({ feature, configForm }: UseFeatureTestRunnerProps) => {
    const [testResult, setTestResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);

    const { handleCustomMutationData } = useCustomMutationData();

    const isScraping = useMemo(
        () => feature.type === DataProviderFeatureType.SCRAPING,
        [feature.type],
    );

    const handleRunTest = useCallback(
        async (values: any): Promise<void> => {
            setIsLoading(true);
            setErrorMessage(null);

            const inputPayload: Record<string, any> = {};
            if (isScraping) {
                inputPayload.url = values.testUrl;
                if (isTestHtmlContent) {
                    inputPayload.htmlContentString = values.htmlContentString;
                }
            } else {
                if (values.testQuery) {
                    inputPayload.query = values.testQuery;
                }
            }

            const currentFormValues = configForm ? configForm.getFieldsValue() : {};
            const activeService =
                currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;
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
                    setIsLoading(false);
                    const data = res?.data?.data || res?.data;
                    setTestResult(data);
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
    };
};
