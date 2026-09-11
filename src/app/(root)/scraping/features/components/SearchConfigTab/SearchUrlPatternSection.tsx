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
import {
    checkService,
    SCRAPER_SERVICE_OPTIONS,
    FEATURE_SECTION_CONTAINER_CLASS,
} from '../../constants';
import { ScraperServiceEnum } from '../../enums';
import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type SearchUrlPatternSectionProps = {
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onServiceChange?: (service: ScraperServiceEnum) => void;
};

export const SearchUrlPatternSection = ({
    feature,
    service = ScraperServiceEnum.GENERIC,
    isViewingHistory,
    selectedVersion,
    onServiceChange,
}: SearchUrlPatternSectionProps) => {
    const { hasUrlPattern } = checkService(service);

    const isServiceDisabled = Boolean(feature?.id || isViewingHistory);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:search"
                title="Cấu hình đường dẫn tìm kiếm"
                description="Lựa chọn engine và định dạng mẫu URL tìm kiếm cho từ khóa"
            />

            <CustomRow gutter={[16, 12]}>
                <CustomCol span={24}>
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
                            disabled={isServiceDisabled}
                            options={SCRAPER_SERVICE_OPTIONS}
                        />
                    </CustomForm.Item>
                </CustomCol>

                {hasUrlPattern && (
                    <CustomCol xs={12}>
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
                    <CustomCol xs={12}>
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
            </CustomRow>
        </CustomFlex>
    );
};
