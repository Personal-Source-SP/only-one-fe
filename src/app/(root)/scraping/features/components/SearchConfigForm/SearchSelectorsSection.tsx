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

export type SearchSelectorsSectionProps = {
    feature: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    service?: string;
};

export const SearchSelectorsSection = ({
    feature,
    isViewingHistory,
    selectedVersion,
    service = ScraperServiceEnum.GENERIC,
}: SearchSelectorsSectionProps) => {
    const { hasWaitForSelector, hasBrowserSettings } = checkService(service);

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
            </CustomRow>
        </CustomFlex>
    );
};
