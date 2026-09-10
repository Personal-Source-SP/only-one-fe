'use client';

import { CustomFlex, CustomForm, CustomInput, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';

export type FeatureChangeLogSectionProps = {
    placeholder?: string;
};

export const FeatureChangeLogSection = ({
    placeholder = 'Ví dụ: Cập nhật selector giá mới theo layout...',
}: FeatureChangeLogSectionProps) => {
    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <CustomFlex align="center" gap="small" className="mb-2">
                <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Mô tả thay đổi phiên bản (Change Log)
                </CustomTypography.Text>
            </CustomFlex>
            <CustomForm.Item
                className="!mb-0"
                name="changeDescription"
                rules={[
                    {
                        required: true,
                        message: 'Vui lòng nhập mô tả thay đổi phiên bản',
                    },
                ]}
            >
                <CustomInput placeholder={placeholder} />
            </CustomForm.Item>
        </CustomFlex>
    );
};
