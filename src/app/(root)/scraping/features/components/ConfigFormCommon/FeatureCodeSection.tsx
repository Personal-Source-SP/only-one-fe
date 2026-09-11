'use client';

import { CodeDisplay } from '@/components/common';
import { CustomFlex, CustomForm, type FormInstance } from '@/components/custom-antd';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { useCurrentService } from '../../hooks';
import { DataProviderFeatureType, type ScraperServiceEnum } from '../../enums';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export type FeatureCodeSectionProps = {
    form?: FormInstance;
    service?: ScraperServiceEnum;
    functionGenerator?: string;
    isViewingHistory?: boolean;
    feature?: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureCodeSection = (props?: FeatureCodeSectionProps) => {
    const context = useFeatureModalContext();
    const currentService = useCurrentService();
    const form = props?.form ?? context.form;
    const feature = props?.feature ?? context.feature;
    const service = props?.service ?? currentService;

    const watchedFunctionGenerator = CustomForm.useWatch('functionGenerator', form);
    const functionGenerator = props?.functionGenerator ?? watchedFunctionGenerator;

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
                title={<FormDiffLabel label={label} fieldKey="functionGenerator" />}
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
