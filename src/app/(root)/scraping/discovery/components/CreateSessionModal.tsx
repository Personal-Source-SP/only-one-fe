'use client';

import { DataProviderFeatureType } from '@/app/(root)/scraping/features/enums';
import {
    CustomInputForm,
    CustomInputFormType,
    CustomModalForm,
    CustomSelectInput,
    CustomSwitchForm,
} from '@/components/common';
import { type CustomSelectProps } from '@/components/custom-antd';
import { FormRuleType } from '@/utilities';
import type { ISearchTargetConfig } from '@/app/(root)/scraping/features/types';
import type { useSelectDataProvider, UseCustomModalFormResponse } from '@/hooks';
import type { CreateSessionFormValues, IDiscoverySession } from '../types';
import { useCallback } from 'react';

type CreateSessionModalProps = {
    modalForm: UseCustomModalFormResponse<
        IDiscoverySession,
        CreateSessionFormValues,
        IDiscoverySession
    >;
    dataProviderOptions?: CustomSelectProps['options'];
    dataProviderQuery?: ReturnType<typeof useSelectDataProvider>['query'];
};

export const CreateSessionModal = ({
    modalForm,
    dataProviderOptions,
    dataProviderQuery,
}: CreateSessionModalProps) => {
    const { formProps } = modalForm;

    const handleDataProviderChange = useCallback(
        (value?: string) => {
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
        },
        [dataProviderQuery, formProps],
    );

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
            <CustomSelectInput
                name="dataProviderId"
                label="Nhà cung cấp dữ liệu"
                rulesConfig={[
                    { type: FormRuleType.Required, message: 'Vui lòng chọn nhà cung cấp' },
                ]}
                selectProps={{
                    options: dataProviderOptions,
                    placeholder: 'Chọn nhà cung cấp',
                    onChange: handleDataProviderChange,
                }}
            />

            <CustomSelectInput
                name="targetKeywords"
                label="Từ khóa sản phẩm mục tiêu (Target Keywords)"
                selectProps={{
                    mode: 'tags',
                    tokenSeparators: [','],
                    placeholder:
                        'Nhập các từ khóa cách nhau bởi dấu phẩy hoặc phím Enter (ví dụ: Sony WH-1000XM4, iPhone 15 Pro, ...)',
                }}
            />

            <CustomInputForm
                name="depth"
                label="Độ sâu thu thập (Crawl Depth)"
                type={CustomInputFormType.Number}
                numberProps={{ min: 1, max: 5 }}
            />

            <CustomInputForm
                name="maxUrls"
                type={CustomInputFormType.Number}
                label="Giới hạn URLs tối đa (Max URLs - Tùy chọn override)"
                numberProps={{ placeholder: 'Mặc định lấy theo cấu hình Search' }}
            />

            <CustomSwitchForm
                name="autoValidate"
                label="Tự động xác thực URL (Auto Validate)"
                description="Tự động kích hoạt hàng đợi xác thực các URL khám phá được ngay khi hoàn tất"
            />
        </CustomModalForm>
    );
};
