'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomRow,
} from '@/components/custom-antd';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import type { ScraperServiceEnum } from '../../enums';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export type FeatureLimitsSectionProps = {
    feature: IDataProviderFeature;
    service?: ScraperServiceEnum;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
};

export const FeatureLimitsSection = ({
    feature,
    service,
    isViewingHistory,
    selectedVersion,
}: FeatureLimitsSectionProps) => {
    const { hasNetworkRetries } = checkService(service);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                icon="lucide:repeat"
                title="Giới hạn & Thời gian chờ"
                description="Kiểm soát số lượng kết quả, số lần thử lại và thời gian timeout"
            />
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} sm={hasNetworkRetries ? 8 : 24}>
                    <CustomForm.Item
                        name="maxResults"
                        label={
                            <FormDiffLabel
                                fieldKey="maxResults"
                                label="Số kết quả tối đa"
                                feature={feature}
                                selectedVersion={selectedVersion}
                                isViewingHistory={isViewingHistory}
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
                                    fieldKey="retryDelay"
                                    label="Delay retry (ms)"
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
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
                                    feature={feature}
                                    selectedVersion={selectedVersion}
                                    isViewingHistory={isViewingHistory}
                                />
                            }
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="3" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasNetworkRetries && (
                    <>
                        <CustomCol xs={24} sm={12}>
                            <CustomForm.Item
                                name="timeout"
                                label={
                                    <FormDiffLabel
                                        fieldKey="timeout"
                                        label="Thời gian chờ Request (ms)"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                }
                            >
                                <CustomInputNumber
                                    min={1000}
                                    className="w-full"
                                    placeholder="30000"
                                />
                            </CustomForm.Item>
                        </CustomCol>
                        <CustomCol xs={24} sm={12}>
                            <CustomForm.Item
                                name="waitForTimeout"
                                label={
                                    <FormDiffLabel
                                        fieldKey="waitForTimeout"
                                        label="Thời gian chờ Selector (ms)"
                                        feature={feature}
                                        selectedVersion={selectedVersion}
                                        isViewingHistory={isViewingHistory}
                                    />
                                }
                            >
                                <CustomInputNumber min={0} className="w-full" placeholder="5000" />
                            </CustomForm.Item>
                        </CustomCol>
                    </>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
