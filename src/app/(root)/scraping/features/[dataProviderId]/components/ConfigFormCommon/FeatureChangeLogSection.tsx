'use client';

import { CustomFlex, CustomForm, CustomInput, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';

export type FeatureChangeLogSectionProps = {
    placeholder?: string;
};

export const FeatureChangeLogSection = ({
    placeholder = 'Ví dụ: Cập nhật selector giá mới theo layout...',
}: FeatureChangeLogSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-2">
                <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Mô tả thay đổi phiên bản (Change Log)
                </CustomTypography.Text>
            </CustomFlex>
            <CustomForm.Item name="changeDescription" className="!mb-0">
                <CustomInput placeholder={placeholder} />
            </CustomForm.Item>
        </CustomFlex>
    );
};
