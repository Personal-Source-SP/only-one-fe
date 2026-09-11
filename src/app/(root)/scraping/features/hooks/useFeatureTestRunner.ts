'use client';

import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { useCallback, useMemo, useState } from 'react';
import { useFeatureModalContext } from '../context';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type {
    FeatureTestInput,
    FeatureTestResult,
    TestFeatureStatelessRequest,
    TestInputFormValues,
} from '../types';
import { extractTargetConfigFromFormValues } from '../utils';

export const useFeatureTestRunner = () => {
    const { feature, form: configForm } = useFeatureModalContext();
    const { handleCustomMutationData, mutation } = useCustomMutationData();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<FeatureTestResult | null>(null);

    const isScraping = useMemo(
        () => feature.type === DataProviderFeatureType.SCRAPING,
        [feature.type],
    );

    const handleRunTest = useCallback(
        async (values: TestInputFormValues): Promise<void> => {
            setErrorMessage(null);

            const currentFormValues = configForm ? configForm.getFieldsValue() : {};
            const activeService =
                currentFormValues.service || feature.service || ScraperServiceEnum.GENERIC;

            const isGeneric = activeService === ScraperServiceEnum.GENERIC;

            const inputPayload: FeatureTestInput = {};
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

            const configPayload = extractTargetConfigFromFormValues(
                currentFormValues,
                feature.config as Record<string, unknown>,
            );

            const requestPayload: TestFeatureStatelessRequest = {
                type: feature.type,
                service: activeService,
                config: configPayload,
                input: inputPayload,
            };

            await handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.DATA_PROVIDER_FEATURES.TEST,
                values: requestPayload,
                successNotification: (res) => {
                    const data = (res?.data?.data || res?.data) as FeatureTestResult;
                    setTestResult(data);

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm thành công',
                    };
                },
                errorNotification: (err) => {
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
        errorMessage,
        isTestHtmlContent,
        isLoading: mutation.mutation.isPending,
        setIsTestHtmlContent,
        handleRunTest,
        setTestResult,
    };
};
