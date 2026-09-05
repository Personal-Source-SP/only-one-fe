'use client';

import { useCallback } from 'react';
import { CustomForm, CustomSpace } from '@/components/custom-antd';
import { useFeatureTestRunner } from '../../hooks';
import type { IDataProviderFeature } from '../../types';
import { TestInputSection } from './TestInputSection';
import { TestModeSelector } from './TestModeSelector';
import { TestResultSection } from './TestResultSection';

export type FeatureTestTabProps = {
    feature: IDataProviderFeature;
};

export const FeatureTestTab = ({ feature }: FeatureTestTabProps) => {
    const [form] = CustomForm.useForm();

    const {
        isScraping,
        testMode,
        testResult,
        isLoading,
        errorMessage,
        isTestHtmlContent,
        setTestMode,
        setIsTestHtmlContent,
        handleRunTest,
    } = useFeatureTestRunner({ feature });

    const onFormSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields();
            await handleRunTest(values);
        } catch (error) {
            console.error('Validation error running test:', error);
        }
    }, [form, handleRunTest]);

    return (
        <CustomSpace direction="vertical" size="middle" className="w-full">
            <TestModeSelector testMode={testMode} onChangeMode={setTestMode} />

            <TestInputSection
                form={form}
                isLoading={isLoading}
                isScraping={isScraping}
                isTestHtmlContent={isTestHtmlContent}
                onRunTest={onFormSubmit}
                onToggleTestHtmlContent={setIsTestHtmlContent}
            />

            <TestResultSection testResult={testResult} errorMessage={errorMessage} />
        </CustomSpace>
    );
};
