'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSwitch,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingAdvancedSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const ScrapingAdvancedSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
}: ScrapingAdvancedSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:shield-check" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Tùy chọn nâng cao
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[12, 12]}>
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
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        </CustomTypography.Text>
                        <CustomForm.Item name="isGetParentElement" valuePropName="checked" noStyle>
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
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
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
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        </CustomTypography.Text>
                        <CustomForm.Item name="cloudflareBypass" valuePropName="checked" noStyle>
                            <CustomSwitch />
                        </CustomForm.Item>
                    </CustomFlex>
                </CustomCol>
            </CustomRow>
        </CustomFlex>
    );
};
