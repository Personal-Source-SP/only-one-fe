'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomSegmented,
    CustomSpace,
    CustomTooltip,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
import { Icon } from '@iconify/react';
import { ScraperServiceEnum } from '../../enums';
import type { IDataProviderFeature } from '../../types';

export type TestInputSectionProps = {
    form: FormInstance;
    isLoading: boolean;
    isScraping: boolean;
    isTestHtmlContent: boolean;
    configForm?: FormInstance;
    feature?: IDataProviderFeature;
    onRunTest: () => void;
    onToggleTestHtmlContent: (checked: boolean) => void;
};

export const TestInputSection = ({
    form,
    isLoading,
    isScraping,
    isTestHtmlContent,
    configForm,
    feature,
    onRunTest,
    onToggleTestHtmlContent,
}: TestInputSectionProps) => {
    const queryPlaceholder = CustomForm.useWatch('queryPlaceholder', configForm);
    const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
    const activeService =
        CustomForm.useWatch('service', configForm) ||
        feature?.service ||
        ScraperServiceEnum.GENERIC;

    const isGeneric = activeService === ScraperServiceEnum.GENERIC;

    const isMissingFunctionGenerator = !functionGenerator?.trim();
    const isQueryRequired = Boolean(
        queryPlaceholder?.trim() || (!configForm && feature?.config?.queryPlaceholder?.trim()),
    );

    return (
        <CustomForm
            form={form}
            layout="vertical"
            initialValues={{
                testUrl: '',
                testQuery: '',
                htmlContentString: DEFAULT_HTML_CONTENT_STRING,
            }}
        >
            <CustomFlex
                vertical
                gap="middle"
                className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4 w-full"
            >
                <CustomFlex
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap="middle"
                    className="w-full"
                >
                    <CustomFlex align="center" gap="small">
                        <Icon icon="lucide:terminal" className="text-hub-primary" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Dữ liệu đầu vào thử nghiệm (Test Payload)
                        </CustomTypography.Text>
                    </CustomFlex>

                    {isGeneric && (
                        <CustomSegmented
                            value={isTestHtmlContent ? 'html' : 'input'}
                            onChange={(value) => onToggleTestHtmlContent(value === 'html')}
                            options={[
                                {
                                    value: 'input',
                                    label: isScraping ? 'URL trực tiếp' : 'Từ khóa tìm kiếm',
                                    icon: (
                                        <Icon
                                            icon={isScraping ? 'lucide:link' : 'lucide:search'}
                                            className="inline mr-1 text-xs"
                                        />
                                    ),
                                },
                                {
                                    value: 'html',
                                    label: 'HTML giả lập',
                                    icon: (
                                        <Icon
                                            icon="lucide:file-code-2"
                                            className="inline mr-1 text-xs"
                                        />
                                    ),
                                },
                            ]}
                        />
                    )}
                </CustomFlex>

                <CustomSpace direction="vertical" size="small" className="w-full">
                    {!isTestHtmlContent || !isGeneric ? (
                        isScraping ? (
                            <CustomForm.Item
                                name="testUrl"
                                label="URL thử nghiệm"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập URL thử nghiệm',
                                    },
                                ]}
                            >
                                <CustomInput placeholder="https://example.com/product/123" />
                            </CustomForm.Item>
                        ) : (
                            <CustomForm.Item
                                name="testQuery"
                                label="Từ khóa tìm kiếm (Query)"
                                rules={
                                    isQueryRequired
                                        ? [
                                              {
                                                  required: true,
                                                  message: 'Vui lòng nhập từ khóa tìm kiếm',
                                              },
                                          ]
                                        : []
                                }
                            >
                                <CustomInput placeholder="Ví dụ: ao-thun, iphone-15" />
                            </CustomForm.Item>
                        )
                    ) : (
                        <CustomForm.Item
                            name="htmlContentString"
                            label="Chuỗi HTML giả lập"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập chuỗi HTML giả lập',
                                },
                            ]}
                        >
                            <CustomInput.TextArea
                                rows={6}
                                placeholder="<html><body>...</body></html>"
                            />
                        </CustomForm.Item>
                    )}
                </CustomSpace>

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
