'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingSelectorsSectionProps = {
    feature: IDataProviderFeature;
    service?: string;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const ScrapingSelectorsSection = ({
    feature,
    service = ScraperServiceEnum.GENERIC,
    isViewingHistory,
    selectedVersion,
}: ScrapingSelectorsSectionProps) => {
    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service);

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:sliders" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Bộ chọn (Selectors) & Tùy chọn
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                {hasDomSelectors && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector nội dung chính"
                                    fieldKey="mainContentSelector"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasWaitForSelector && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="waitForSelector"
                            label={
                                <FormDiffLabel
                                    fieldKey="waitForSelector"
                                    label="Selector chờ (Wait for selector)"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasBrowserSettings && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="userAgent"
                            label={
                                <FormDiffLabel
                                    fieldKey="userAgent"
                                    label="User Agent tùy chỉnh"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CustomInput placeholder="Mozilla/5.0..." />
                        </CustomForm.Item>
                    </CustomCol>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
