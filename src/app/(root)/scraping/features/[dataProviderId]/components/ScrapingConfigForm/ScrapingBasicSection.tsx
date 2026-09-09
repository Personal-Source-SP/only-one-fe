'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomRow,
    CustomSelect,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { SCRAPER_SERVICE_OPTIONS } from '../../constants';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { FormDiffLabel } from '../FormDiffLabel';

export type ScrapingBasicSectionProps = {
    feature: IDataProviderFeature;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onServiceChange: (service: string) => void;
};

export const ScrapingBasicSection = ({
    feature,
    isViewingHistory,
    selectedVersion,
    onServiceChange,
}: ScrapingBasicSectionProps) => {
    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Cấu hình chung
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                <CustomCol span={24}>
                    <CustomForm.Item
                        name="service"
                        label={
                            <FormDiffLabel
                                fieldKey="service"
                                label="Service Engine"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
                            />
                        }
                        rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                    >
                        <CustomSelect
                            onChange={onServiceChange}
                            options={SCRAPER_SERVICE_OPTIONS}
                        />
                    </CustomForm.Item>
                </CustomCol>
            </CustomRow>
        </CustomFlex>
    );
};
