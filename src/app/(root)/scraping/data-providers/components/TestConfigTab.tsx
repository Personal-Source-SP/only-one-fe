'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomCard,
    CustomForm,
    CustomInput,
    CustomSwitch,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export interface TestConfigTabProps {
    form: FormInstance;
    title?: string;
    inputLabel?: string;
    isLoading: boolean;
    isTestHtmlContent: boolean;
    testResultData: Record<string, unknown> | null;
    htmlContentString?: string;
    onTestHtmlContentChange: (checked: boolean) => void;
    onTestParser: () => void;
}

export const TestConfigTab = ({
    form,
    title = 'Thử nghiệm parser',
    inputLabel = 'URL thử nghiệm',
    isLoading,
    isTestHtmlContent,
    testResultData,
    htmlContentString,
    onTestHtmlContentChange,
    onTestParser,
}: TestConfigTabProps) => {
    return (
        <div className="space-y-4">
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:flask-conical" className="text-hub-primary shrink-0" />
                    <span>{title}</span>
                </h4>

                <CustomForm.Item name="testUrl" label={inputLabel} className="!mb-3">
                    <CustomInput placeholder="https://shopee.vn/product/123" />
                </CustomForm.Item>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <CustomSwitch
                            checked={isTestHtmlContent}
                            onChange={onTestHtmlContentChange}
                        />
                        <span className="text-sm text-hub-muted">
                            Sử dụng HTML content mẫu thay cho URL
                        </span>
                    </div>

                    <CustomButton
                        type="primary"
                        loading={isLoading}
                        onClick={onTestParser}
                        icon={<Icon icon="lucide:play" />}
                        className="w-full sm:w-auto"
                    >
                        Chạy thử nghiệm
                    </CustomButton>
                </div>

                {isTestHtmlContent && (
                    <CustomForm.Item
                        name="htmlContentString"
                        label="Nội dung HTML mẫu"
                        className="!mb-0 mt-3"
                    >
                        <CodeDisplay
                            expanded
                            language="html"
                            code={htmlContentString || ''}
                            onCodeChange={(newCode: string) => {
                                form.setFieldValue('htmlContentString', newCode);
                            }}
                        />
                    </CustomForm.Item>
                )}
            </div>

            {testResultData && (
                <CustomCard className="border-hub-border bg-hub-section/20 shadow-xs rounded-xl">
                    <CustomTypography.Title level={5} className="!mb-3 flex items-center gap-2">
                        <Icon icon="lucide:check-circle-2" className="text-emerald-500 shrink-0" />
                        <span>Kết quả trích xuất:</span>
                    </CustomTypography.Title>
                    <CodeDisplay
                        isDisplayLanguage
                        language="json"
                        title="Dữ liệu kết quả"
                        code={JSON.stringify(testResultData, null, 2)}
                    />
                </CustomCard>
            )}
        </div>
    );
};
