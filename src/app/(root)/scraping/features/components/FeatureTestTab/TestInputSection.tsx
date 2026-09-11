'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomSegmented,
    CustomSpace,
    CustomTooltip,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING } from '@/constants';
import { Icon } from '@iconify/react';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureTestContext } from '../../context';
import { ScraperServiceEnum } from '../../enums';
import type { ISearchTargetConfig } from '../../types';
import { SectionHeader } from '../ConfigFormCommon';

export const TestInputSection = () => {
    const {
        form,
        isLoading,
        isScraping,
        isTestHtmlContent,
        configForm,
        feature,
        onRunTest,
        setIsTestHtmlContent,
    } = useFeatureTestContext();

    const queryPlaceholder = CustomForm.useWatch('queryPlaceholder', configForm);
    const functionGenerator = CustomForm.useWatch('functionGenerator', configForm);
    const activeService =
        CustomForm.useWatch('service', configForm) ||
        feature?.service ||
        ScraperServiceEnum.GENERIC;

    const isGeneric = activeService === ScraperServiceEnum.GENERIC;

    const isMissingFunctionGenerator = !functionGenerator?.trim();

    const isQueryRequired = Boolean(
        queryPlaceholder?.trim() ||
        (!configForm && (feature?.config as ISearchTargetConfig)?.queryPlaceholder?.trim()),
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
            <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
                <SectionHeader
                    icon="lucide:terminal"
                    title="Dữ liệu đầu vào thử nghiệm"
                    description="Cung cấp URL hoặc từ khóa tìm kiếm để kiểm tra logic bóc tách"
                    extra={
                        isGeneric ? (
                            <CustomSegmented
                                value={isTestHtmlContent ? 'html' : 'input'}
                                onChange={(value) => setIsTestHtmlContent(value === 'html')}
                                options={[
                                    {
                                        value: 'input',
                                        label: isScraping ? 'URL trực tiếp' : 'Từ khóa',
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
                        ) : undefined
                    }
                />

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
