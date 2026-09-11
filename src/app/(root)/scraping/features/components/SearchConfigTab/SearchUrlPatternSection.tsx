'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSelect,
} from '@/components/custom-antd';
import {
    checkService,
    SCRAPER_SERVICE_OPTIONS,
    FEATURE_SECTION_CONTAINER_CLASS,
} from '../../constants';
import type { ScraperServiceEnum } from '../../enums';
import { useFeatureModalContext } from '../../context';
import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';

export type SearchUrlPatternSectionProps = {
    onServiceChange?: (service: ScraperServiceEnum) => void;
};

export const SearchUrlPatternSection = ({ onServiceChange }: SearchUrlPatternSectionProps) => {
    const { feature, isViewingHistory, currentService } = useFeatureModalContext();

    const { hasUrlPattern } = checkService(currentService);
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
                        label={<FormDiffLabel fieldKey="service" label="Service Engine" />}
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
