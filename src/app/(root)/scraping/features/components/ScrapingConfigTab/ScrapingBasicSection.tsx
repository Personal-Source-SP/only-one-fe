'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSelect,
} from '@/components/custom-antd';
import { FEATURE_SECTION_CONTAINER_CLASS, SCRAPER_SERVICE_OPTIONS } from '../../constants';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import type { ScraperServiceEnum } from '../../enums';
import { useFeatureModalContext } from '../../context';
import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';

export type ScrapingBasicSectionProps = {
    feature?: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onServiceChange?: (service: ScraperServiceEnum) => void;
};

export const ScrapingBasicSection = ({
    feature: propFeature,
    isViewingHistory: propIsViewingHistory,
    onServiceChange,
}: ScrapingBasicSectionProps) => {
    const context = useFeatureModalContext();
    const feature = propFeature ?? context.feature;
    const isViewingHistory = propIsViewingHistory ?? context.isViewingHistory;

    const isServiceDisabled = Boolean(feature?.id || isViewingHistory);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                title="Cấu hình chung"
                icon="lucide:settings-2"
                description="Lựa chọn công cụ trích xuất (Service Engine) phù hợp cho tính năng"
            />
            <CustomRow gutter={[16, 12]}>
                <CustomCol span={24}>
                    <CustomForm.Item
                        name="service"
                        label={<FormDiffLabel fieldKey="service" label="Service Engine" />}
                        rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                    >
                        <CustomSelect
                            onChange={onServiceChange}
                            disabled={isServiceDisabled}
                            options={SCRAPER_SERVICE_OPTIONS}
                        />
                    </CustomForm.Item>
                </CustomCol>
            </CustomRow>
        </CustomFlex>
    );
};
