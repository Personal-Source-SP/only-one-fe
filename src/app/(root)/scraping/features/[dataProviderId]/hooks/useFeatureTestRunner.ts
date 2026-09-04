'use client';

import { useCallback, useMemo, useState } from 'react';
import { DataProviderFeatureType, MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import type { IDataProviderFeature } from '../types';

export type UseFeatureTestRunnerProps = {
    feature: IDataProviderFeature;
};

export const useFeatureTestRunner = ({ feature }: UseFeatureTestRunnerProps) => {
    const [testResult, setTestResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [testMode, setTestMode] = useState<'stateless' | 'contextual'>('stateless');

    const { handleCustomMutationData } = useCustomMutationData();

    const isScraping = useMemo(
        () => feature.type === DataProviderFeatureType.SCRAPING,
        [feature.type],
    );

    const handleRunStatelessTest = useCallback(
        (values: any): void => {
            const inputPayload: Record<string, any> = {};
            if (isScraping) {
                inputPayload.url = values.testUrl;
                if (isTestHtmlContent) {
                    inputPayload.htmlContentString = values.htmlContentString;
                }
            } else {
                inputPayload.query = values.testQuery || 'ao-thun';
            }

            handleCustomMutationData({
                method: 'post',
                url: 'data-provider-features/test',
                values: {
                    type: feature.type,
                    service: feature.service || 'generic',
                    config: feature.config || {},
                    input: inputPayload,
                },
                successNotification: (res) => {
                    setIsLoading(false);
                    const data = res?.data?.data || res?.data;
                    setTestResult(data);
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm Stateless thành công',
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
        [isScraping, isTestHtmlContent, feature, handleCustomMutationData],
    );

    const handleRunContextualTest = useCallback(
        (values: any): void => {
            const inputPayload: Record<string, any> = {};
            if (isScraping && values.testUrl) {
                inputPayload.url = values.testUrl;
            } else if (!isScraping && values.testQuery) {
                inputPayload.query = values.testQuery;
            }

            handleCustomMutationData({
                method: 'post',
                url: `data-provider-features/${feature.id}/test`,
                values: {
                    input: inputPayload,
                },
                successNotification: (res) => {
                    setIsLoading(false);
                    const data = res?.data?.data || res?.data;
                    setTestResult(data);
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm Contextual thành công',
                    };
                },
                errorNotification: (err) => {
                    setIsLoading(false);
                    setErrorMessage(err?.message || 'Đã xảy ra lỗi khi thử nghiệm contextual');
                    return {
                        type: MessageType.ERROR,
                        message: 'Thử nghiệm thất bại',
                        description: err?.message,
                    };
                },
            });
        },
        [isScraping, feature.id, handleCustomMutationData],
    );

    const handleRunTest = useCallback(
        async (formValues: any): Promise<void> => {
            setIsLoading(true);
            setErrorMessage(null);

            if (testMode === 'stateless') {
                handleRunStatelessTest(formValues);
            } else {
                handleRunContextualTest(formValues);
            }
        },
        [testMode, handleRunStatelessTest, handleRunContextualTest],
    );

    return {
        isScraping,
        testMode,
        testResult,
        isLoading,
        errorMessage,
        isTestHtmlContent,
        setTestMode,
        setIsTestHtmlContent,
        handleRunTest,
    };
};
