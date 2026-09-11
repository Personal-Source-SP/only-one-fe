'use client';

import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
} from '@/components/custom-antd';
import { checkService, FEATURE_SECTION_CONTAINER_CLASS } from '../../constants';
import { useFeatureModalContext } from '../../context';
import { FormDiffLabel, SectionHeader } from '../ConfigFormCommon';

export const ScrapingSelectorsSection = () => {
    const { currentService } = useFeatureModalContext();
    const { hasDomSelectors, hasWaitForSelector, hasBrowserSettings, hasApiParams } =
        checkService(currentService);

    return (
        <CustomFlex vertical className={FEATURE_SECTION_CONTAINER_CLASS}>
            <SectionHeader
                title="Bộ chọn (Selectors) & Tham số truy vấn"
                icon="lucide:sliders"
                description="Thiết lập các bộ chọn DOM CSS hoặc tham số gọi API"
            />
            <CustomRow gutter={[16, 12]}>
                {hasDomSelectors && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector nội dung chính"
                                    fieldKey="mainContentSelector"
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasWaitForSelector && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="waitForSelector"
                            label={
                                <FormDiffLabel
                                    label="Selector chờ (Wait for selector)"
                                    fieldKey="waitForSelector"
                                />
                            }
                        >
                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasBrowserSettings && (
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="userAgent"
                            label={
                                <FormDiffLabel fieldKey="userAgent" label="User Agent tùy chỉnh" />
                            }
                        >
                            <CustomInput placeholder="Mozilla/5.0..." />
                        </CustomForm.Item>
                    </CustomCol>
                )}

                {hasApiParams && (
                    <>
                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="queryParams"
                                label={
                                    <FormDiffLabel
                                        label="API Query Params"
                                        fieldKey="queryParams"
                                    />
                                }
                            >
                                <CustomInput placeholder="Ví dụ: page={page}&limit={limit}" />
                            </CustomForm.Item>
                        </CustomCol>
                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="firstQueryParams"
                                label={
                                    <FormDiffLabel
                                        label="First Query Params (trang đầu)"
                                        fieldKey="firstQueryParams"
                                    />
                                }
                            >
                                <CustomInput placeholder="Ví dụ: limit={limit}" />
                            </CustomForm.Item>
                        </CustomCol>
                    </>
                )}
            </CustomRow>
        </CustomFlex>
    );
};
