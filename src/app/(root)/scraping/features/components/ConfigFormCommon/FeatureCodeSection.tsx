'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomFlex,
    CustomForm,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { DataProviderFeatureType, type ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type FeatureCodeSectionProps = {
    form: FormInstance;
    service?: ScraperServiceEnum;
    functionGenerator?: string;
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureCodeSection = ({
    form,
    service,
    functionGenerator,
    isViewingHistory,
    feature,
    selectedVersion,
}: FeatureCodeSectionProps) => {
    const { scrapingCodeLabel, searchCodeLabel } = checkService(service);

    const isSearch = feature.type === DataProviderFeatureType.SEARCH;
    const label = isSearch ? searchCodeLabel : scrapingCodeLabel;
    const requiredMessage = isSearch
        ? 'Vui lòng nhập nội dung hàm tìm kiếm'
        : 'Vui lòng nhập nội dung hàm parser';

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:code-2"
                description="Hàm JavaScript xử lý dữ liệu trích xuất từ trang web hoặc phản hồi API"
                title={
                    <FormDiffLabel
                        label={label}
                        fieldKey="functionGenerator"
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                }
            />
            <CustomForm.Item
                name="functionGenerator"
                rules={[{ required: true, message: requiredMessage }]}
            >
                <CodeDisplay
                    isDisplayLanguage
                    language="javascript"
                    code={functionGenerator || ''}
                    onCodeChange={(newCode: string): void => {
                        form.setFieldValue('functionGenerator', newCode);
                    }}
                />
            </CustomForm.Item>
        </CustomFlex>
    );
};
