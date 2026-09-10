'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomFlex,
    CustomForm,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { DataProviderFeatureType, type ScraperServiceEnum } from '../../enums';
import { FormDiffLabel } from './FormDiffLabel';
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
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    <FormDiffLabel
                        label={label}
                        fieldKey="functionGenerator"
                        feature={feature}
                        selectedVersion={selectedVersion}
                        isViewingHistory={isViewingHistory}
                    />
                </CustomTypography.Text>
            </CustomFlex>
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
