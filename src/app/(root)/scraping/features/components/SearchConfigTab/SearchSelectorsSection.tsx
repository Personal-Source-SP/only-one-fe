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

export type SearchSelectorsSectionProps = {
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const SearchSelectorsSection = ({
    feature,
    service,
    isViewingHistory,
    selectedVersion,
}: SearchSelectorsSectionProps) => {
    const { hasWaitForSelector, hasBrowserSettings, hasApiParams } = checkService(service);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:sliders"
                title="Bộ chọn (Selectors) & Tham số tìm kiếm"
                description="Thiết lập CSS Selectors cho vùng chứa và từng phần tử kết quả"
            />

            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} md={12}>
                    <CustomForm.Item
                        name="mainContentSelector"
                        label={
                            <FormDiffLabel
                                fieldKey="mainContentSelector"
                                label="Selector vùng chứa kết quả"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
                            />
                        }
                    >
                        <CustomInput placeholder="Ví dụ: #search-results, .products-grid" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol xs={24} md={12}>
                    <CustomForm.Item
                        name="resultSelector"
                        label={
                            <FormDiffLabel
                                fieldKey="resultSelector"
                                label="Selector từng phần tử kết quả"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
                            />
                        }
                    >
                        <CustomInput placeholder="Ví dụ: .product-item, article.card" />
                    </CustomForm.Item>
                </CustomCol>

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
                            <CustomInput placeholder="Ví dụ: .search-results, #loaded" />
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
                                        fieldKey="firstQueryParams"
                                        label="First Query Params (trang đầu)"
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
