'use client';

import { useState, type FC, type JSX } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSegmented,
    CustomSwitch,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
import { DataProviderFeatureType, MessageType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IDataProviderFeature } from '@/app/(root)/scraping/features/[dataProviderId]/types';

interface FeatureTestTabProps {
    feature: IDataProviderFeature;
}

export const FeatureTestTab: FC<FeatureTestTabProps> = ({ feature }): JSX.Element => {
    const [form] = CustomForm.useForm();
    const [testMode, setTestMode] = useState<'stateless' | 'contextual'>('stateless');
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { handleCustomMutationData } = useCustomMutationData();
    const isScraping = feature.type === DataProviderFeatureType.SCRAPING;

    const handleRunTest = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);
            setErrorMessage(null);

            if (testMode === 'stateless') {
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
            } else {
                // Contextual test against saved feature
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
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Validation error running test:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Mode selection & Description */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-semibold text-hub-title flex items-center gap-2">
                            <Icon icon="lucide:flask-conical" className="text-hub-primary" />
                            <span>Chế độ thử nghiệm</span>
                        </h4>
                        <p className="text-xs text-hub-subtitle mt-0.5">
                            {testMode === 'stateless'
                                ? 'Stateless Sandbox: Chạy trực tiếp cấu hình với input tùy chỉnh độc lập.'
                                : 'Contextual Test: Chạy cấu hình đã lưu trên backend với provider hiện tại.'}
                        </p>
                    </div>

                    <CustomSegmented
                        value={testMode}
                        onChange={(value) => setTestMode(value as 'stateless' | 'contextual')}
                        options={[
                            { label: 'Stateless Sandbox', value: 'stateless' },
                            { label: 'Contextual Test', value: 'contextual' },
                        ]}
                    />
                </div>
            </div>

            {/* Input Configuration */}
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    testUrl: '',
                    testQuery: 'ao-thun',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                }}
            >
                <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                        <Icon icon="lucide:terminal" className="text-hub-primary" />
                        <span>Dữ liệu đầu vào thử nghiệm (Test Payload)</span>
                    </h4>

                    {isScraping ? (
                        <div className="space-y-3">
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
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-1 sm:mt-7">
                                        <span className="text-xs text-hub-title font-medium">
                                            Test bằng HTML
                                        </span>
                                        <CustomSwitch
                                            checked={isTestHtmlContent}
                                            onChange={setIsTestHtmlContent}
                                        />
                                    </div>
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
                        </div>
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
                </div>
            </CustomForm>

            {/* Error banner if test fails */}
            {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl p-4 flex items-start gap-3">
                    <Icon icon="lucide:alert-circle" className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="font-semibold">Thử nghiệm phát sinh lỗi</h5>
                        <p className="text-xs mt-1">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Output Results Panel */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-hub-title flex items-center gap-2">
                        <Icon icon="lucide:code" className="text-hub-primary" />
                        <span>Kết quả trích xuất (Execution Output)</span>
                    </h4>
                    {testResult && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
                            Thành công
                        </span>
                    )}
                </div>

                {testResult ? (
                    <CodeDisplay language="json" code={JSON.stringify(testResult, null, 2)} />
                ) : (
                    <div className="p-8 text-center text-hub-subtitle text-xs border border-dashed border-hub-border rounded-lg bg-hub-card/50">
                        Chưa có dữ liệu kết quả. Nhập URL/Query và nhấn &ldquo;Chạy thử
                        nghiệm&rdquo; để xem kết quả.
                    </div>
                )}
            </div>
        </div>
    );
};
