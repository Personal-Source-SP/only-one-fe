'use client';

import { useCallback, useMemo, useState } from 'react';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';

import type { FormInstance } from '@/components/custom-antd';
import { useFeatureModalContext } from '../context';
import { DataProviderFeatureType, ScraperServiceEnum } from '../enums';
import type { FeatureTestResult, IDataProviderFeature, TestInputFormValues } from '../types';
import { extractTargetConfigFromFormValues } from '../utils';

export type UseFeatureTestRunnerProps = {
    feature?: IDataProviderFeature;
    configForm?: FormInstance;
};

export const useFeatureTestRunner = (props: UseFeatureTestRunnerProps = {}) => {
    const modal = useFeatureModalContext();
    const feature = props.feature ?? modal.feature;
    const configForm = props.configForm ?? modal.form;

    const { handleCustomMutationData } = useCustomMutationData();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<FeatureTestResult | null>(null);

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

            const configPayload = extractTargetConfigFromFormValues(
                currentFormValues,
                feature.config as Record<string, unknown>,
            );

            handleCustomMutationData({
                method: 'post',
                url: API_ENDPOINT.DATA_PROVIDER_FEATURES.TEST,
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
