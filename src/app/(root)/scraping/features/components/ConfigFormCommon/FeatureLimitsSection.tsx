'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomRow,
} from '@/components/custom-antd';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useCurrentService } from '../../hooks';
import { FormDiffLabel } from './FormDiffLabel';
import { SectionHeader } from './SectionHeader';

export type FeatureLimitsSectionProps = Record<string, never>;

export const FeatureLimitsSection = (_props?: FeatureLimitsSectionProps) => {
    const service = useCurrentService();
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
                        label={<FormDiffLabel fieldKey="maxResults" label="Số kết quả tối đa" />}
                    >
                        <CustomInputNumber min={1} className="w-full" placeholder="10" />
                    </CustomForm.Item>
                </CustomCol>

                {hasNetworkRetries && (
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name="retryDelay"
                            label={<FormDiffLabel fieldKey="retryDelay" label="Delay retry (ms)" />}
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
                                <FormDiffLabel fieldKey="retryAttempts" label="Số lần thử lại" />
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
