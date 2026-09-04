'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomFlex,
    CustomForm,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingCodeSectionProps = {
    form: FormInstance;
    functionGenerator?: string;
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
};

export const ScrapingCodeSection = ({
    form,
    functionGenerator,
    isViewingHistory,
    feature,
    selectedVersion,
}: ScrapingCodeSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    <FormDiffLabel
                        label="Mã nguồn Hàm Parser (functionGenerator)"
                        fieldKey="functionGenerator"
                        isViewingHistory={isViewingHistory}
                        feature={feature}
                        selectedVersion={selectedVersion}
                    />
                </CustomTypography.Text>
            </CustomFlex>
            <CustomForm.Item
                name="functionGenerator"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung hàm parser' }]}
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
