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
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import type { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingSelectorsSectionProps = {
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const ScrapingSelectorsSection = ({
    feature,
    service,
    isViewingHistory,
    selectedVersion,
}: ScrapingSelectorsSectionProps) => {
    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings, hasApiParams } =
        checkService(service);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                title="Bộ chọn (Selectors) & Tham số truy vấn"
                icon="lucide:sliders"
                description="Thiết lập các bộ chọn DOM CSS hoặc tham số gọi API"
            />
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

                {hasApiParams && (
                    <>
                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="queryParams"
                                label={
                                    <FormDiffLabel
                                        label="API Query Params"
                                        fieldKey="queryParams"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                }
                            >
                                <CustomInput placeholder="Ví dụ: page={page}&limit={limit}" />
                            </CustomForm.Item>
                        </CustomCol>
                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="firstQueryParams"
                                label={
                                    <FormDiffLabel
                                        label="First Query Params (trang đầu)"
                                        fieldKey="firstQueryParams"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                }
                            >
                                <CustomInput placeholder="Ví dụ: limit={limit}" />
                            </CustomForm.Item>
                        </CustomCol>
                    </>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
