'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import type { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from './FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureAdvancedSectionProps = {
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureAdvancedSection = ({
    feature,
    service,
    isViewingHistory,
    selectedVersion,
}: FeatureAdvancedSectionProps) => {
    const { hasBrowserSettings, hasAdvancedHeaders } = checkService(service);

    if (!hasBrowserSettings && !hasAdvancedHeaders) {
        return null;
    }

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:shield-check" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Mạng & Trình duyệt Nâng cao
                </CustomTypography.Text>
            </CustomFlex>

            {/* Browser Feature Switches */}
            {hasBrowserSettings && (
                <CustomRow gutter={[12, 12]} className="mb-3">
                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Lấy phần tử cha"
                                    fieldKey="isGetParentElement"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item
                                name="isGetParentElement"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Stealth Mode"
                                    fieldKey="stealthMode"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Vượt Cloudflare"
                                    fieldKey="cloudflareBypass"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item
                                name="cloudflareBypass"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Bật JavaScript"
                                    fieldKey="javascriptEnabled"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item
                                name="javascriptEnabled"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Tải hình ảnh"
                                    fieldKey="imagesEnabled"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item name="imagesEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomFlex
                            align="center"
                            justify="space-between"
                            className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                        >
                            <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                <FormDiffLabel
                                    label="Tải CSS"
                                    fieldKey="cssEnabled"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            </CustomTypography.Text>
                            <CustomForm.Item name="cssEnabled" valuePropName="checked" noStyle>
                                <CustomSwitch />
                            </CustomForm.Item>
                        </CustomFlex>
                    </CustomCol>
                </CustomRow>
            )}

            {/* Custom Headers & Cookies JSON Inputs */}
            {hasAdvancedHeaders && (
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} sm={12}>
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
                            <CustomInput.TextArea
                                rows={3}
                                placeholder='{"Authorization": "Bearer token", "x-custom-key": "value"}'
                            />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={12}>
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
                            <CustomInput.TextArea
                                rows={3}
                                placeholder='[{"name": "session_id", "value": "xyz", "domain": ".example.com"}]'
                            />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            )}
        </CustomFlex>
    );
};
