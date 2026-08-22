'use client';

import { useEffect, useState } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomCol,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRow,
    CustomSelect,
    CustomSwitch,
    CustomTag,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_SEARCH_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type {
    IConfigVersion,
    IDataProviderFeature,
} from '@/app/(root)/scraping/features/[dataProviderId]/types';

type SearchConfigFormProps = {
    form?: FormInstance;
    feature: IDataProviderFeature;
    selectedVersion?: IConfigVersion | null;
    isViewingHistory?: boolean;
    setIsSaving?: (loading: boolean) => void;
    onClose: () => void;
    onSuccess: () => void;
};

export const SearchConfigForm = ({
    form: externalForm,
    feature,
    selectedVersion,
    isViewingHistory,
    setIsSaving: externalSetIsSaving,
    onClose,
    onSuccess,
}: SearchConfigFormProps) => {
    const [internalForm] = CustomForm.useForm();
    const form = externalForm || internalForm;
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const { handleCustomMutationData } = useCustomMutationData();

    const functionGenerator = CustomForm.useWatch('functionGenerator', form);
    const isDraft = !feature.id;

    useEffect(() => {
        externalSetIsSaving?.(isSaving);
    }, [isSaving, externalSetIsSaving]);

    useEffect(() => {
        const config = selectedVersion?.config || feature.config || {};
        const service =
            selectedVersion?.config?.service || feature.service || ScraperServiceEnum.GENERIC;

        form.setFieldsValue({
            service,
            changeDescription: '',
            searchUrlPattern: config.searchUrlPattern || '',
            queryPlaceholder: config.queryPlaceholder || '{query}',
            mainContentSelector: config.mainContentSelector || '',
            resultSelector: config.resultSelector || '',
            maxResults: config.maxResults ?? 10,
            isGetParentElement: config.isGetParentElement ?? false,
            functionGenerator: config.functionGenerator || DEFAULT_SEARCH_FUNCTION_GENERATOR,
        });
    }, [feature, selectedVersion, form]);

    const handleSave = async (values: any): Promise<void> => {
        try {
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
                          changeDescription: changeDescription || 'Cập nhật cấu hình tìm kiếm',
                          config: configValues,
                      },
                successNotification: () => {
                    setIsSaving(false);
                    onSuccess();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: isDraft
                            ? 'Khởi tạo và lưu cấu hình tìm kiếm thành công'
                            : 'Lưu cấu hình tìm kiếm thành công',
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
            console.error('Save search config error:', error);
        }
    };

    const renderLabel = (label: string, fieldKey: string) => {
        if (!isViewingHistory) return label;

        const currentConfig = (feature.config || {}) as Record<string, any>;
        const snapshotConfig = (selectedVersion?.config || {}) as Record<string, any>;

        let isDifference = false;
        let compareText = '';

        if (fieldKey === 'service') {
            const currentService = feature.service || ScraperServiceEnum.GENERIC;
            const snapshotService =
                snapshotConfig.service ||
                selectedVersion?.config?.service ||
                ScraperServiceEnum.GENERIC;
            if (currentService !== snapshotService) {
                isDifference = true;
                compareText = `Hiện tại: ${currentService}`;
            }
        } else {
            const currentVal = currentConfig[fieldKey];
            const snapshotVal = snapshotConfig[fieldKey];

            if (typeof currentVal === 'boolean' || typeof snapshotVal === 'boolean') {
                if (Boolean(currentVal) !== Boolean(snapshotVal)) {
                    isDifference = true;
                    compareText = currentVal ? 'Hiện tại: Bật' : 'Hiện tại: Tắt';
                }
            } else if (
                currentVal !== snapshotVal &&
                (currentVal !== undefined || snapshotVal !== undefined)
            ) {
                isDifference = true;
                compareText =
                    currentVal !== undefined && currentVal !== ''
                        ? `Hiện tại: ${currentVal}`
                        : 'Hiện tại: Trống';
            }
        }

        return (
            <span className="inline-flex items-center gap-2">
                <span>{label}</span>
                {isDifference && (
                    <CustomTag color="warning" className="text-[10px] px-1.5 py-0 font-normal m-0">
                        {compareText}
                    </CustomTag>
                )}
            </span>
        );
    };

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave} className="space-y-4">
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
                            label={renderLabel('Service Engine', 'service')}
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
                            label={renderLabel(
                                'Mẫu URL tìm kiếm (Search URL Pattern)',
                                'searchUrlPattern',
                            )}
                            rules={[{ required: true, message: 'Vui lòng nhập mẫu URL tìm kiếm' }]}
                        >
                            <CustomInput placeholder="Ví dụ: https://example.com/search?q={query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="queryPlaceholder"
                            label={renderLabel('Placeholder từ khóa', 'queryPlaceholder')}
                        >
                            <CustomInput placeholder="{query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="maxResults"
                            label={renderLabel('Số kết quả tối đa', 'maxResults')}
                        >
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Selectors */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:sliders" className="text-hub-primary shrink-0" />
                    <span>Bộ chọn (Selectors) & Tùy chọn</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="mainContentSelector"
                            label={renderLabel('Selector vùng chứa kết quả', 'mainContentSelector')}
                        >
                            <CustomInput placeholder="Ví dụ: #search-results, .products-grid" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="resultSelector"
                            label={renderLabel('Selector từng phần tử kết quả', 'resultSelector')}
                        >
                            <CustomInput placeholder="Ví dụ: .product-item, article.card" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
                            <span className="text-sm text-hub-title font-medium">
                                {renderLabel('Lấy phần tử cha', 'isGetParentElement')}
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

            {/* Function Generator code */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                    <span>
                        {renderLabel(
                            'Mã nguồn Hàm Tìm kiếm (functionGenerator)',
                            'functionGenerator',
                        )}
                    </span>
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
            {!isDraft && (
                <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-hub-title mb-2 flex items-center gap-2">
                        <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                        <span>Mô tả thay đổi phiên bản (Change Log)</span>
                    </h4>
                    <CustomForm.Item name="changeDescription" className="!mb-0">
                        <CustomInput placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                    </CustomForm.Item>
                </div>
            )}
        </CustomForm>
    );
};
