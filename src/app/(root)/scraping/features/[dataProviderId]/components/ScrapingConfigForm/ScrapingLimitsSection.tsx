'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomRow,
    CustomTypography,
} from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { checkService } from '../../constants';
import { FormDiffLabel } from '../FormDiffLabel';
import type { IConfigVersion, IDataProviderFeature } from '../../types';

export type ScrapingLimitsSectionProps = {
    isViewingHistory?: boolean;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    service?: string;
};

export const ScrapingLimitsSection = ({
    isViewingHistory,
    feature,
    selectedVersion,
    service,
}: ScrapingLimitsSectionProps) => {
    const { hasNetworkRetries } = checkService(service);

    return (
        <CustomFlex
            vertical
            className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
        >
            <CustomFlex align="center" gap="small" className="mb-3">
                <Icon icon="lucide:repeat" className="text-hub-primary shrink-0" />
                <CustomTypography.Text strong className="text-sm text-hub-title">
                    Giới hạn & Thử lại
                </CustomTypography.Text>
            </CustomFlex>
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} sm={hasNetworkRetries ? 8 : 24}>
                    <CustomForm.Item
                        name="maxResults"
                        label={
                            <FormDiffLabel
                                label="Số kết quả tối đa"
                                fieldKey="maxResults"
                                isViewingHistory={isViewingHistory}
                                feature={feature}
                                selectedVersion={selectedVersion}
                            />
                        }
                    >
                        <CustomInputNumber min={1} className="w-full" placeholder="10" />
                    </CustomForm.Item>
                </CustomCol>

                {hasNetworkRetries && (
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name="retryDelay"
                            label={
                                <FormDiffLabel
                                    label="Delay retry (ms)"
                                    fieldKey="retryDelay"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="1000" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasNetworkRetries && (
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name="retryAttempts"
                            label={
                                <FormDiffLabel
                                    label="Số lần thử lại"
                                    fieldKey="retryAttempts"
                                    isViewingHistory={isViewingHistory}
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                />
                            }
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="3" />
                        </CustomForm.Item>
                    </CustomCol>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
