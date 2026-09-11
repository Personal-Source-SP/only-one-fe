'use client';

import { useCallback } from 'react';
import { CustomCol, CustomForm, CustomRow } from '@/components/custom-antd';
import { useFeatureModalContext } from '../../context';
import { useFeatureTestRunner } from '../../hooks';
import { TestInputSection } from './TestInputSection';
import { TestResultSection } from './TestResultSection';

export const FeatureTestTab = () => {
    const { form: configForm, feature } = useFeatureModalContext();
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

    const onFormSubmit = useCallback(async () => {
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

    return (
        <CustomRow gutter={[16, 16]}>
            <CustomCol xs={24} lg={10}>
                <TestInputSection
                    form={form}
                    feature={feature}
                    configForm={configForm}
                    isLoading={isLoading}
                    isScraping={isScraping}
                    isTestHtmlContent={isTestHtmlContent}
                    onRunTest={onFormSubmit}
                    onToggleTestHtmlContent={setIsTestHtmlContent}
                />
            </CustomCol>
            <CustomCol xs={24} lg={14}>
                <TestResultSection testResult={testResult} errorMessage={errorMessage} />
            </CustomCol>
        </CustomRow>
    );
};
