'use client';

import { CustomFlex, CustomForm, CustomInput, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';

import { SectionHeader } from './SectionHeader';

export type FeatureChangeLogSectionProps = {
    placeholder?: string;
};

export const FeatureChangeLogSection = ({
    placeholder = 'Ví dụ: Cập nhật selector giá mới theo layout...',
}: FeatureChangeLogSectionProps) => {
    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                title="Mô tả thay đổi phiên bản (Change Log)"
                icon="lucide:file-text"
                description="Ghi chú tóm tắt nội dung chỉnh sửa cấu hình cho lần lưu này"
            />
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
