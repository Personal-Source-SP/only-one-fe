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
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type SearchSelectorsSectionProps = {
    feature: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const SearchSelectorsSection = ({
    feature,
    isViewingHistory,
    selectedVersion,
}: SearchSelectorsSectionProps) => {
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
                                label="Selector vùng chứa kết quả"
                                fieldKey="mainContentSelector"
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
            </CustomRow>
        </CustomFlex>
    );
};
