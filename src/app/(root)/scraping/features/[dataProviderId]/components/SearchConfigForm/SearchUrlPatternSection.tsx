'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRow,
    CustomSelect,
    CustomTypography,
} from '@/components/custom-antd';
import { ScraperServiceEnum } from '@/enums';
import { Icon } from '@iconify/react';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type SearchUrlPatternSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const SearchUrlPatternSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
}: SearchUrlPatternSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:search" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Cấu hình đường dẫn tìm kiếm
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} md={12}>
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
                            options={[
                                {
                                    label: 'Generic HTML Parser',
                                    value: ScraperServiceEnum.GENERIC,
                                },
                                { label: 'Puppeteer Headless', value: 'puppeteer' },
                            ]}
                        />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol xs={24} md={12}>
                    <CustomForm.Item
                        name="searchUrlPattern"
                        label={
                            <FormDiffLabel
                                label="Mẫu URL tìm kiếm (Search URL Pattern)"
                                fieldKey="searchUrlPattern"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mẫu URL tìm kiếm',
                            },
                        ]}
                    >
                        <CustomInput placeholder="Ví dụ: https://example.com/search?q={query}" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol xs={24} md={12}>
                    <CustomForm.Item
                        name="queryPlaceholder"
                        label={
                            <FormDiffLabel
                                label="Placeholder từ khóa"
                                fieldKey="queryPlaceholder"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                    >
                        <CustomInput placeholder="{query}" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol xs={24} md={12}>
                    <CustomForm.Item
                        name="maxResults"
                        label={
                            <FormDiffLabel
                                label="Số kết quả tối đa"
                                fieldKey="maxResults"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                    >
                        <CustomInputNumber min={1} className="w-full" placeholder="10" />
                    </CustomForm.Item>
                </CustomCol>
            </CustomRow>
        </CustomFlex>
    );
};
