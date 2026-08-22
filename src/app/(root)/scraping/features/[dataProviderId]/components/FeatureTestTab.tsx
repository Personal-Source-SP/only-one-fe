'use client';

import { useMemo, useState } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomAlert,
    CustomButton,
    CustomCol,
    CustomEmpty,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSegmented,
    CustomSpace,
    CustomSwitch,
    CustomTag,
    CustomTypography,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
import { DataProviderFeatureType, MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IDataProviderFeature } from '../types';

type FeatureTestTabProps = {
    feature: IDataProviderFeature;
};

export const FeatureTestTab = ({ feature }: FeatureTestTabProps) => {
    const [form] = CustomForm.useForm();

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

    const handleRunStatelessTest = (values: any): void => {
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
    };

    const handleRunContextualTest = (values: any): void => {
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
    };

    const handleRunTest = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);
            setErrorMessage(null);

            if (testMode === 'stateless') {
                handleRunStatelessTest(values);
            } else {
                handleRunContextualTest(values);
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Validation error running test:', error);
        }
    };

    return (
        <CustomSpace direction="vertical" size="middle" className="w-full">
            {/* Mode selection & Description */}
            <CustomFlex
                vertical
                className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
            >
                <CustomFlex
                    align="center"
                    justify="space-between"
                    gap="middle"
                    className="w-full flex-wrap"
                >
                    <CustomFlex vertical gap={2}>
                        <CustomFlex align="center" gap="small">
                            <Icon icon="lucide:flask-conical" className="text-hub-primary" />
                            <CustomTypography.Text strong className="text-sm text-hub-title">
                                Chế độ thử nghiệm
                            </CustomTypography.Text>
                        </CustomFlex>
                        <CustomTypography.Paragraph
                            type="secondary"
                            className="!mb-0 text-xs text-hub-subtitle"
                        >
                            {testMode === 'stateless'
                                ? 'Stateless Sandbox: Chạy trực tiếp cấu hình với input tùy chỉnh độc lập.'
                                : 'Contextual Test: Chạy cấu hình đã lưu trên backend với provider hiện tại.'}
                        </CustomTypography.Paragraph>
                    </CustomFlex>

                    <CustomSegmented
                        value={testMode}
                        onChange={(value) => setTestMode(value as 'stateless' | 'contextual')}
                        options={[
                            { label: 'Stateless Sandbox', value: 'stateless' },
                            { label: 'Contextual Test', value: 'contextual' },
                        ]}
                    />
                </CustomFlex>
            </CustomFlex>

            {/* Input Configuration Form */}
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    testUrl: '',
                    testQuery: 'ao-thun',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                }}
            >
                <CustomFlex
                    vertical
                    gap="middle"
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4 w-full"
                >
                    <CustomFlex align="center" gap="small">
                        <Icon icon="lucide:terminal" className="text-hub-primary" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Dữ liệu đầu vào thử nghiệm (Test Payload)
                        </CustomTypography.Text>
                    </CustomFlex>

                    {isScraping ? (
                        <CustomSpace direction="vertical" size="small" className="w-full">
                            <CustomRow gutter={[16, 12]}>
                                <CustomCol xs={24} md={18}>
                                    <CustomForm.Item
                                        name="testUrl"
                                        label="URL thử nghiệm"
                                        rules={[
                                            {
                                                required: !isTestHtmlContent,
                                                message: 'Vui lòng nhập URL thử nghiệm',
                                            },
                                        ]}
                                    >
                                        <CustomInput placeholder="https://example.com/product/123" />
                                    </CustomForm.Item>
                                </CustomCol>

                                <CustomCol xs={24} md={6}>
                                    <CustomFlex
                                        align="center"
                                        justify="space-between"
                                        className="p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-1 sm:mt-7"
                                    >
                                        <CustomTypography.Text className="text-xs text-hub-title font-medium">
                                            Test bằng HTML
                                        </CustomTypography.Text>
                                        <CustomSwitch
                                            checked={isTestHtmlContent}
                                            onChange={setIsTestHtmlContent}
                                        />
                                    </CustomFlex>
                                </CustomCol>
                            </CustomRow>

                            {isTestHtmlContent && (
                                <CustomForm.Item
                                    name="htmlContentString"
                                    label="Chuỗi HTML giả lập"
                                >
                                    <CustomInput.TextArea
                                        rows={6}
                                        placeholder="<html><body>...</body></html>"
                                    />
                                </CustomForm.Item>
                            )}
                        </CustomSpace>
                    ) : (
                        <CustomForm.Item
                            name="testQuery"
                            label="Từ khóa tìm kiếm (Query)"
                            rules={[{ required: true, message: 'Vui lòng nhập từ khóa tìm kiếm' }]}
                        >
                            <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
                        </CustomForm.Item>
                    )}

                    <CustomFlex justify="end">
                        <CustomButton
                            type="primary"
                            loading={isLoading}
                            onClick={handleRunTest}
                            icon={<Icon icon="lucide:play" />}
                        >
                            Chạy thử nghiệm
                        </CustomButton>
                    </CustomFlex>
                </CustomFlex>
            </CustomForm>

            {/* Error banner if test fails */}
            {errorMessage && (
                <CustomAlert
                    type="error"
                    title="Thử nghiệm phát sinh lỗi"
                    description={errorMessage}
                    className="rounded-xl border-rose-500/20 bg-rose-500/10"
                />
            )}

            {/* Output Results Panel */}
            <CustomFlex
                vertical
                className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4 w-full"
            >
                <CustomFlex align="center" justify="space-between" className="mb-3 w-full">
                    <CustomFlex align="center" gap="small">
                        <Icon icon="lucide:code" className="text-hub-primary" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Kết quả trích xuất (Execution Output)
                        </CustomTypography.Text>
                    </CustomFlex>
                    {testResult && (
                        <CustomTag color="success" className="font-medium m-0">
                            Thành công
                        </CustomTag>
                    )}
                </CustomFlex>

                {testResult ? (
                    <CodeDisplay language="json" code={JSON.stringify(testResult, null, 2)} />
                ) : (
                    <CustomEmpty
                        description={
                            <CustomTypography.Text type="secondary" className="text-xs">
                                Chưa có dữ liệu kết quả. Nhập URL/Query và nhấn &ldquo;Chạy thử
                                nghiệm&rdquo; để xem kết quả.
                            </CustomTypography.Text>
                        }
                        className="p-6 border border-dashed border-hub-border/60 rounded-lg bg-hub-card/50 my-0"
                    />
                )}
            </CustomFlex>
        </CustomSpace>
    );
};
