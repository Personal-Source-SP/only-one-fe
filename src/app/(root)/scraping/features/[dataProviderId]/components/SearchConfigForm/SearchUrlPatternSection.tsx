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
import { Icon } from '@iconify/react';
import { checkService, SCRAPER_SERVICE_OPTIONS } from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type SearchUrlPatternSectionProps = {
    feature: IDataProviderFeature;
    service?: string;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onServiceChange?: (service: string) => void;
};

export const SearchUrlPatternSection = ({
    feature,
    service = ScraperServiceEnum.GENERIC,
    isViewingHistory,
    selectedVersion,
    onServiceChange,
}: SearchUrlPatternSectionProps) => {
    const { hasUrlPattern } = checkService(service);

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
                <CustomCol xs={24} md={hasUrlPattern ? 12 : 12}>
                    <CustomForm.Item
                        name="service"
                        rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                        label={
                            <FormDiffLabel
                                fieldKey="service"
                                label="Service Engine"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
                            />
                        }
                    >
                        <CustomSelect
                            onChange={onServiceChange}
                            options={SCRAPER_SERVICE_OPTIONS}
                        />
                    </CustomForm.Item>
                </CustomCol>

                {hasUrlPattern && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="searchUrlPattern"
                            label={
                                <FormDiffLabel
                                    fieldKey="searchUrlPattern"
                                    label="Mẫu URL tìm kiếm (Search URL Pattern)"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
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
                )}

                {hasUrlPattern && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="queryPlaceholder"
                            label={
                                <FormDiffLabel
                                    fieldKey="queryPlaceholder"
                                    label="Placeholder từ khóa"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CustomInput placeholder="{query}" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                <CustomCol xs={24} md={hasUrlPattern ? 12 : 12}>
                    <CustomForm.Item
                        name="maxResults"
                        label={
                            <FormDiffLabel
                                fieldKey="maxResults"
                                label="Số kết quả tối đa"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
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
