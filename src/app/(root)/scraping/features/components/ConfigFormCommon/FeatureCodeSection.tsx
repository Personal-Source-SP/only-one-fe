'use client';

import { CodeDisplay } from '@/components/common';
import { CustomFlex, CustomForm } from '@/components/custom-antd';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { DataProviderFeatureType } from '../../enums';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export const FeatureCodeSection = () => {
    const { form, feature, currentService } = useFeatureModalContext();
    const { scrapingCodeLabel, searchCodeLabel } = checkService(currentService);

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

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
