'use client';

import { useEffect, useState } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRow,
    CustomSelect,
    CustomSwitch,
} from '@/components/custom-antd';
import { DEFAULT_API_FUNCTION_GENERATOR, DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IDataProviderFeature } from '@/app/(root)/scraping/features/[dataProviderId]/types';

type ScrapingConfigFormProps = {
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
};

export const ScrapingConfigForm = ({ feature, onClose, onSuccess }: ScrapingConfigFormProps) => {
    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const isDraft = !feature.id;

    useEffect(() => {
        const config = feature.config || {};
        form.setFieldsValue({
            service: feature.service || ScraperServiceEnum.GENERIC,
            changeDescription: '',
            functionGenerator: config.functionGenerator || DEFAULT_PARSER_FUNCTION_GENERATOR,
            mainContentSelector: config.mainContentSelector || '',
            waitForSelector: config.waitForSelector || '',
            userAgent: config.userAgent || '',
            maxResults: config.maxResults ?? 10,
            retryDelay: config.retryDelay ?? 1000,
            retryAttempts: config.retryAttempts ?? 3,
            isGetParentElement: config.isGetParentElement ?? false,
            stealthMode: config.stealthMode ?? false,
            cloudflareBypass: config.cloudflareBypass ?? false,
            javascriptEnabled: config.javascriptEnabled ?? true,
            imagesEnabled: config.imagesEnabled ?? false,
            cssEnabled: config.cssEnabled ?? false,
        });
    }, [feature, form]);

    const handleServiceChange = (service: string) => {
        if (service === ScraperServiceEnum.API) {
            form.setFieldValue('functionGenerator', DEFAULT_API_FUNCTION_GENERATOR);
        } else if (service === ScraperServiceEnum.GENERIC) {
            form.setFieldValue('functionGenerator', DEFAULT_PARSER_FUNCTION_GENERATOR);
        }
    };

    const handleSave = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            handleCustomMutationData({
                method: isDraft ? 'post' : 'put',
                url: isDraft
                    ? `data-provider-features/data-providers/${feature.dataProviderId}`
                    : `data-provider-features/${feature.id}`,
                values: isDraft
                    ? {
                          type: feature.type,
                          service: service || ScraperServiceEnum.GENERIC,
                          config: configValues,
                      }
                    : {
                          service,
                          changeDescription: changeDescription || 'Cập nhật cấu hình cào',
                          config: configValues,
                      },
                successNotification: () => {
                    setIsSaving(false);
                    onSuccess();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: isDraft
                            ? 'Khởi tạo và lưu cấu hình cào thành công'
                            : 'Lưu cấu hình cào thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsSaving(false);
                    return {
                        type: MessageType.ERROR,
                        message: isDraft ? 'Khởi tạo cấu hình thất bại' : 'Lưu cấu hình thất bại',
                        description: error?.message,
                    };
                },
            });
        } catch (error) {
            setIsSaving(false);
            console.error('Save scraping config error:', error);
        }
    };

    return (
        <CustomForm form={form} layout="vertical" className="space-y-4">
            {/* General & Selectors */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                    <span>Cấu hình chung & Selectors</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="service"
                            label="Service Engine"
                            rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                        >
                            <CustomSelect
                                onChange={handleServiceChange}
                                options={[
                                    { label: 'API Scraper', value: ScraperServiceEnum.API },
                                    {
                                        label: 'Generic HTML Parser',
                                        value: ScraperServiceEnum.GENERIC,
                                    },
                                    {
                                        label: 'Local Folder Scraper',
                                        value: ScraperServiceEnum.LOCAL,
                                    },
                                ]}
                            />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item name="mainContentSelector" label="Selector nội dung chính">
                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="waitForSelector"
                            label="Selector chờ (Wait for selector)"
                        >
                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item name="userAgent" label="User Agent tùy chỉnh">
                            <CustomInput placeholder="Mozilla/5.0..." />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Limits & Retry */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:repeat" className="text-hub-primary shrink-0" />
                    <span>Giới hạn & Thử lại</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item name="maxResults" label="Số kết quả tối đa">
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item name="retryDelay" label="Delay retry (ms)">
                            <CustomInputNumber min={0} className="w-full" placeholder="1000" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item name="retryAttempts" label="Số lần thử lại">
                            <CustomInputNumber min={0} className="w-full" placeholder="3" />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Advanced switches */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:shield-check" className="text-hub-primary shrink-0" />
                    <span>Tùy chọn nâng cao</span>
                </h4>
                <CustomRow gutter={[12, 12]}>
                    <CustomCol xs={24} sm={8}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
                            <span className="text-sm text-hub-title font-medium">
                                Lấy phần tử cha
                            </span>
                            <CustomForm.Item
                                name="isGetParentElement"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </div>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
                            <span className="text-sm text-hub-title font-medium">Stealth Mode</span>
                            <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                                <CustomSwitch />
                            </CustomForm.Item>
                        </div>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
                            <span className="text-sm text-hub-title font-medium">
                                Vượt Cloudflare
                            </span>
                            <CustomForm.Item
                                name="cloudflareBypass"
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </div>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Function Generator code */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                    <span>Mã nguồn Hàm Parser (functionGenerator)</span>
                </h4>
                <CustomForm.Item
                    name="functionGenerator"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung hàm parser' }]}
                >
                    <CodeDisplay
                        isDisplayLanguage
                        language="javascript"
                        code={functionGenerator || ''}
                        onCodeChange={(newCode: string): void => {
                            form.setFieldValue('functionGenerator', newCode);
                        }}
                    />
                </CustomForm.Item>
            </div>

            {/* Change Log description (shown when editing existing feature) */}
            {!isDraft && (
                <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-hub-title mb-2 flex items-center gap-2">
                        <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                        <span>Mô tả thay đổi phiên bản (Change Log)</span>
                    </h4>
                    <CustomForm.Item name="changeDescription" className="!mb-0">
                        <CustomInput placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                    </CustomForm.Item>
                </div>
            )}

            {/* Footer Buttons */}
            <CustomFlex justify="end" gap={8} className="pt-2">
                <CustomButton onClick={onClose} disabled={isSaving}>
                    Hủy
                </CustomButton>
                <CustomButton
                    type="primary"
                    loading={isSaving}
                    onClick={handleSave}
                    icon={<Icon icon="lucide:save" />}
                >
                    Lưu cấu hình
                </CustomButton>
            </CustomFlex>
        </CustomForm>
    );
};
