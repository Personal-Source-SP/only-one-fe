'use client';

import {
    CustomButton,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSpace,
    CustomSwitch,
    CustomTooltip,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
import { Icon } from '@iconify/react';

export type TestInputSectionProps = {
    form: FormInstance;
    isLoading: boolean;
    isScraping: boolean;
    isTestHtmlContent: boolean;
    configForm?: FormInstance;
    onRunTest: () => void;
    onToggleTestHtmlContent: (checked: boolean) => void;
};

export const TestInputSection = ({
    form,
    isLoading,
    isScraping,
    isTestHtmlContent,
    configForm,
    onRunTest,
    onToggleTestHtmlContent,
}: TestInputSectionProps) => {
    const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
    const isMissingFunctionGenerator = !functionGenerator?.trim();

    return (
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
                                        onChange={onToggleTestHtmlContent}
                                    />
                                </CustomFlex>
                            </CustomCol>
                        </CustomRow>

                        {isTestHtmlContent && (
                            <CustomForm.Item name="htmlContentString" label="Chuỗi HTML giả lập">
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
                    <CustomTooltip
                        title={
                            isMissingFunctionGenerator
                                ? 'Vui lòng nhập hàm functionGenerator bên form cấu hình trước khi chạy thử nghiệm'
                                : undefined
                        }
                    >
                        <span>
                            <CustomButton
                                type="primary"
                                loading={isLoading}
                                onClick={onRunTest}
                                icon={<Icon icon="lucide:play" />}
                                disabled={isLoading || isMissingFunctionGenerator}
                            >
                                Chạy thử nghiệm
                            </CustomButton>
                        </span>
                    </CustomTooltip>
                </CustomFlex>
            </CustomFlex>
        </CustomForm>
    );
};
