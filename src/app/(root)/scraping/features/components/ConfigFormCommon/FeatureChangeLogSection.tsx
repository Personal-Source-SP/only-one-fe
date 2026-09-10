'use client';

import { CustomFlex, CustomForm, CustomInput } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import type { IDataProviderFeature } from '../../types';
import { SectionHeader } from './SectionHeader';

export type FeatureChangeLogSectionProps = {
    placeholder?: string;
    isViewingHistory?: boolean;
    feature?: IDataProviderFeature;
};

export const FeatureChangeLogSection = ({
    placeholder = 'Lý do thay đổi phiên bản (ví dụ: Cập nhật selector giá mới theo layout...)',
    isViewingHistory = false,
    feature,
}: FeatureChangeLogSectionProps) => {
    const isDraft = !feature?.id;
    if (isDraft || isViewingHistory) return null;

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:file-pen-line"
                title="Mô tả thay đổi phiên bản (Change Log)"
                description="Ghi chú tóm tắt lý do cập nhật cấu hình cho snapshot phiên bản mới"
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
                <CustomInput
                    placeholder={placeholder}
                    prefix={<Icon icon="lucide:file-pen-line" className="text-hub-subtitle" />}
                />
            </CustomForm.Item>
        </CustomFlex>
    );
};
