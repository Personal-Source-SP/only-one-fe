'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSwitch,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import type { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureAdvancedSectionProps = {
    form: FormInstance;
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    headers?: string;
    cookies?: string;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureAdvancedSection = ({
    form,
    feature,
    service,
    headers,
    cookies,
    isViewingHistory,
    selectedVersion,
}: FeatureAdvancedSectionProps) => {
    const { hasBrowserSettings, hasAdvancedHeaders } = checkService(service);
    if (!hasBrowserSettings && !hasAdvancedHeaders) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:shield-check"
                title="Mạng & Trình duyệt Nâng cao"
                description="Tùy chọn mô phỏng trình duyệt, vượt bảo vệ chống bot và Headers/Cookies"
            />

            {/* Browser Feature Switches */}
            {hasBrowserSettings && (
                <CustomRow gutter={[12, 12]} className="mb-3">
                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Lấy phần tử cha"
                                        fieldKey="isGetParentElement"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Trích xuất toàn bộ container bao ngoài của selector
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="isGetParentElement"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Stealth Mode"
                                        fieldKey="stealthMode"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Ẩn dấu vết tự động hóa để tránh bị trang web chặn
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Vượt Cloudflare"
                                        fieldKey="cloudflareBypass"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tự động giải thử thách Turnstile / Cloudflare challenge
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="cloudflareBypass"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Bật JavaScript"
                                        fieldKey="javascriptEnabled"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Thực thi JavaScript để render nội dung web động
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item
                                name="javascriptEnabled"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Tải hình ảnh"
                                        fieldKey="imagesEnabled"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tải tài nguyên hình ảnh (tắt để tăng tốc crawl)
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="imagesEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={12} lg={8}>
                        <CustomFlex
                            gap="small"
                            align="flex-start"
                            justify="space-between"
                            className="p-3.5 rounded-lg bg-hub-card border border-hub-border/50 h-full"
                        >
                            <CustomFlex vertical gap={2} className="min-w-0 flex-1 pr-2">
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    <FormDiffLabel
                                        label="Tải CSS"
                                        fieldKey="cssEnabled"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                </CustomTypography.Text>
                                <CustomTypography.Text className="text-xs text-hub-subtitle leading-snug">
                                    Tải định dạng CSS styles (tắt để tiết kiệm băng thông)
                                </CustomTypography.Text>
                            </CustomFlex>
                            <CustomForm.Item name="cssEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch className="mt-0.5" />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>
                </CustomRow>
            )}

            {/* Custom Headers & Cookies JSON Inputs */}
            {hasAdvancedHeaders && (
                <CustomRow gutter={[16, 12]}>
                    <CustomCol span={24}>
                        <CustomForm.Item
                            name="headers"
                            label={
                                <FormDiffLabel
                                    fieldKey="headers"
                                    label="Tùy chỉnh Headers (JSON)"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CodeDisplay
                                language="json"
                                isDisplayLanguage
                                maxHeight="160px"
                                code={headers || ''}
                                onCodeChange={(newCode: string): void => {
                                    form.setFieldValue('headers', newCode);
                                }}
                            />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol span={24}>
                        <CustomForm.Item
                            name="cookies"
                            label={
                                <FormDiffLabel
                                    fieldKey="cookies"
                                    label="Tùy chỉnh Cookies (JSON Array)"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CodeDisplay
                                language="json"
                                isDisplayLanguage
                                maxHeight="160px"
                                code={cookies || ''}
                                onCodeChange={(newCode: string): void => {
                                    form.setFieldValue('cookies', newCode);
                                }}
                            />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            )}
        </CustomFlex>
    );
};
