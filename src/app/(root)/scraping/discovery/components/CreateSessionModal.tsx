'use client';

import { DataProviderFeatureType } from '@/app/(root)/scraping/features/enums';
import { CustomModalForm } from '@/components/common';
import {
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomSelect,
    CustomSwitch,
    CustomTypography,
    type CustomSelectProps,
} from '@/components/custom-antd';
import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
import type { useSelectDataProvider, UseCustomModalFormResponse } from '@/hooks';
import type { CreateSessionFormValues, IDiscoverySession } from '../types';

interface CreateSessionModalProps {
    modalForm: UseCustomModalFormResponse<
        IDiscoverySession,
        CreateSessionFormValues,
        IDiscoverySession
    >;
    dataProviderOptions?: CustomSelectProps['options'];
    dataProviderQuery?: ReturnType<typeof useSelectDataProvider>['query'];
}

export const CreateSessionModal = ({
    modalForm,
    dataProviderOptions,
    dataProviderQuery,
}: CreateSessionModalProps) => {
    const { formProps } = modalForm;

    const handleDataProviderChange = (value?: string) => {
        if (!value) {
            formProps.form?.setFieldValue('maxUrls', undefined);
            return;
        }

        const dataProvider = dataProviderQuery?.data?.data?.find((item) => item.id === value);
        const searchFeature = dataProvider?.features?.find(
            (f) => f.type === DataProviderFeatureType.SEARCH,
        );
        const searchConfig = searchFeature?.config as ISearchTargetConfig | undefined;
        formProps.form?.setFieldValue('maxUrls', searchConfig?.maxResults ?? undefined);
    };

    return (
        <CustomModalForm<IDiscoverySession, CreateSessionFormValues, IDiscoverySession>
            width={720}
            cancelText="Hủy"
            modalForm={modalForm}
            okText="Bắt đầu khám phá"
            title="Khởi tạo phiên khám phá mới (Discovery Session)"
            createInitialValues={{
                depth: 1,
                dataProviderId: '',
                targetKeywords: [],
                maxUrls: undefined,
                autoValidate: true,
            }}
        >
            <CustomForm.Item
                name="dataProviderId"
                label="Nhà cung cấp dữ liệu"
                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
            >
                <CustomSelect
                    allowClear
                    options={dataProviderOptions}
                    placeholder="Chọn nhà cung cấp"
                    onChange={handleDataProviderChange}
                />
            </CustomForm.Item>

            <CustomForm.Item
                name="targetKeywords"
                label="Từ khóa sản phẩm mục tiêu (Target Keywords)"
            >
                <CustomSelect
                    mode="tags"
                    tokenSeparators={[',']}
                    placeholder="Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)"
                />
            </CustomForm.Item>

            <CustomForm.Item name="depth" label="Độ sâu thu thập (Crawl Depth)">
                <CustomInputNumber min={1} max={5} className="w-full" />
            </CustomForm.Item>

            <CustomForm.Item
                name="maxUrls"
                label="Giới hạn URLs tối đa (Max URLs - Tùy chọn override)"
            >
                <CustomInputNumber
                    className="w-full"
                    placeholder="Mặc định lấy theo cấu hình Search"
                />
            </CustomForm.Item>

            <CustomForm.Item
                name="autoValidate"
                valuePropName="checked"
                label="Tự động xác thực URL (Auto Validate)"
            >
                <CustomFlex align="center" gap="middle">
                    <CustomSwitch />
                    <CustomTypography.Text type="secondary" className="text-xs">
                        Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất
                    </CustomTypography.Text>
                </CustomFlex>
            </CustomForm.Item>
        </CustomModalForm>
    );
};
