'use client';

import { CustomForm, type FormInstance } from '@/components/custom-antd';
import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from 'react';
import { useFeatureTestRunner } from '../hooks';
import type { FeatureTestResult, IDataProviderFeature } from '../types';

export interface FeatureTestContextValue {
    form: FormInstance;
    isLoading: boolean;
    isScraping: boolean;
    configForm: FormInstance;
    isTestHtmlContent: boolean;
    errorMessage: string | null;
    feature: IDataProviderFeature;
    testResult: FeatureTestResult | null;
    setIsTestHtmlContent: (val: boolean) => void;
    onRunTest: () => Promise<void>;
}

export const FeatureTestContext = createContext<FeatureTestContextValue | null>(null);

export interface FeatureTestProviderProps extends PropsWithChildren {
    feature: IDataProviderFeature;
    configForm: FormInstance;
}

export const FeatureTestProvider = ({
    feature,
    configForm,
    children,
}: FeatureTestProviderProps) => {
    const [form] = CustomForm.useForm();

    const {
        isScraping,
        testResult,
        isLoading,
        errorMessage,
        isTestHtmlContent,
        setIsTestHtmlContent,
        handleRunTest,
    } = useFeatureTestRunner();

    const onRunTest = useCallback(async () => {
        try {
            if (configForm) {
                await configForm.validateFields();
            }

            const values = await form.validateFields();
            await handleRunTest(values);
        } catch (error) {
            console.error('Validation error running test:', error);
        }
    }, [form, configForm, handleRunTest]);

    const value: FeatureTestContextValue = useMemo(
        () => ({
            form,
            feature,
            configForm,
            isLoading,
            isScraping,
            testResult,
            errorMessage,
            isTestHtmlContent,
            setIsTestHtmlContent,
            onRunTest,
        }),
        [
            feature,
            configForm,
            form,
            isLoading,
            isScraping,
            testResult,
            errorMessage,
            isTestHtmlContent,
            setIsTestHtmlContent,
            onRunTest,
        ],
    );

    return <FeatureTestContext.Provider value={value}>{children}</FeatureTestContext.Provider>;
};

export const useFeatureTestContext = (): FeatureTestContextValue => {
    const context = useContext(FeatureTestContext);
    if (!context) {
        throw new Error('useFeatureTestContext must be used within a FeatureTestProvider');
    }
    return context;
};
