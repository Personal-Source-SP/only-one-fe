'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSelect,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService, SCRAPER_SERVICE_OPTIONS } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingBasicSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    service?: string;
    onServiceChange: (service: string) => void;
};

export const ScrapingBasicSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
    service = ScraperServiceEnum.GENERIC,
    onServiceChange,
}: ScrapingBasicSectionProps) => {
    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings } = checkService(service);

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Cấu hình chung & Selectors
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} md={hasDomSelectors ? 12 : 24}>
                    <CustomForm.Item
                        name="service"
                        label={
                            <FormDiffLabel
                                label="Service Engine"
                                fieldKey="service"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                        rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                    >
                        <CustomSelect
                            onChange={onServiceChange}
                            options={SCRAPER_SERVICE_OPTIONS}
                        />
                    </CustomForm.Item>
                </CustomCol>

                {hasDomSelectors && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector nội dung chính"
                                    fieldKey="mainContentSelector"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
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
                                    label="Selector chờ (Wait for selector)"
                                    fieldKey="waitForSelector"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
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
                                    label="User Agent tùy chỉnh"
                                    fieldKey="userAgent"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
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
