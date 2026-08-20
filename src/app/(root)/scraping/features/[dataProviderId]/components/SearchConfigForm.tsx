'use client';

import { useEffect, useState, type FC, type JSX } from 'react';
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
import { DEFAULT_SEARCH_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import type { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';

interface SearchConfigFormProps {
    feature: NDataProvider.IDataProviderFeature;
    onSuccess: () => void;
    onClose: () => void;
}

export const SearchConfigForm: FC<SearchConfigFormProps> = ({
    feature,
    onSuccess,
    onClose,
}): JSX.Element => {
    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

    useEffect(() => {
        const config = feature.config || {};
        form.setFieldsValue({
            service: feature.service || ScraperServiceEnum.GENERIC,
            changeDescription: '',
            searchUrlPattern: config.searchUrlPattern || '',
            queryPlaceholder: config.queryPlaceholder || '{query}',
            mainContentSelector: config.mainContentSelector || '',
            resultSelector: config.resultSelector || '',
            maxResults: config.maxResults ?? 10,
            isGetParentElement: config.isGetParentElement ?? false,
            functionGenerator: config.functionGenerator || DEFAULT_SEARCH_FUNCTION_GENERATOR,
        });
    }, [feature, form]);

    const handleSave = async (): Promise<void> => {
        try {
            const values = await form.validateFields();
            setIsSaving(true);

            const { service, changeDescription, ...configValues } = values;

            handleCustomMutationData({
                method: 'put',
                url: `data-provider-features/${feature.id}`,
                values: {
                    service,
                    changeDescription: changeDescription || 'Cập nhật cấu hình tìm kiếm',
                    config: configValues,
                },
                successNotification: () => {
                    setIsSaving(false);
                    onSuccess();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Lưu cấu hình tìm kiếm thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsSaving(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Lưu cấu hình thất bại',
                        description: error?.message,
                    };
                },
            });
        } catch (error) {
            setIsSaving(false);
            console.error('Save search config error:', error);
        }
    };

    return (
        <CustomForm form={form} layout="vertical" className="space-y-4">
            {/* Search URL Pattern & Query Placeholder */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:search" className="text-hub-primary shrink-0" />
                    <span>Cấu hình đường dẫn tìm kiếm</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="service"
                            label="Service Engine"
                            rules={[{ required: true, message: 'Vui lòng chọn engine' }]}
                        >
                            <CustomSelect
                                options={[
                                    {
                                        label: 'Generic HTML Parser',
                                        value: ScraperServiceEnum.GENERIC,
                                    },
                                    { label: 'Puppeteer Headless', value: 'puppeteer' },
                                ]}
                            />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="searchUrlPattern"
                            label="Mẫu URL tìm kiếm (Search URL Pattern)"
                            rules={[{ required: true, message: 'Vui lòng nhập mẫu URL tìm kiếm' }]}
                        >
                            <CustomInput placeholder="Ví dụ: https://example.com/search?q={query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item name="queryPlaceholder" label="Placeholder từ khóa">
                            <CustomInput placeholder="{query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item name="maxResults" label="Số kết quả tối đa">
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Selectors */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:crosshair" className="text-hub-primary shrink-0" />
                    <span>Selectors kết quả tìm kiếm</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label="Selector vùng chứa kết quả chính"
                        >
                            <CustomInput placeholder="Ví dụ: .search-results, #products-grid" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="resultSelector"
                            label="Selector từng sản phẩm kết quả"
                        >
                            <CustomInput placeholder="Ví dụ: .product-item, a.item-card" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={12}>
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
                </CustomRow>
            </div>

            {/* Code Generator */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                    <span>Mã nguồn Hàm Tìm kiếm (functionGenerator)</span>
                </h4>
                <CustomForm.Item
                    name="functionGenerator"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung hàm tìm kiếm' }]}
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

            {/* Change Log */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-2 flex items-center gap-2">
                    <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                    <span>Mô tả thay đổi phiên bản (Change Log)</span>
                </h4>
                <CustomForm.Item name="changeDescription" className="!mb-0">
                    <CustomInput placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                </CustomForm.Item>
            </div>

            {/* Footer */}
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
