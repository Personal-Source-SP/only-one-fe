'use client';

import { useEffect, useMemo, useState } from 'react';
import { CodeDisplay } from '@/components/common';
import {
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRow,
    CustomSelect,
    CustomSwitch,
    CustomTag,
    CustomTypography,
    type FormInstance,
} from '@/components/custom-antd';
import { DEFAULT_SEARCH_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IConfigVersion, IDataProviderFeature } from '../types';

type SearchConfigFormProps = {
    feature: IDataProviderFeature;
    form?: FormInstance;
    selectedVersion?: IConfigVersion | null;
    isViewingHistory?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    setIsSaving?: (loading: boolean) => void;
};

export const SearchConfigForm = ({
    feature,
    form: externalForm,
    selectedVersion,
    isViewingHistory,
    onClose,
    onSuccess,
    setIsSaving: externalSetIsSaving,
}: SearchConfigFormProps) => {
    const [internalForm] = CustomForm.useForm();
    const form = externalForm || internalForm;

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isDraft = useMemo(() => !feature.id, [feature.id]);
    const functionGenerator = CustomForm.useWatch('functionGenerator', form);

    const { handleCustomMutationData } = useCustomMutationData();

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
        setIsSaving(true);

        const { service, changeDescription, ...configValues } = values;

        const method = isDraft ? 'post' : 'put';
        const endpoint = isDraft
            ? `data-provider-features/data-providers/${feature.dataProviderId}`
            : `data-provider-features/${feature.id}`;

        const payload: Record<string, any> = {
            config: configValues,
            service: service || ScraperServiceEnum.GENERIC,
        };

        if (!isDraft) {
            payload.changeDescription = changeDescription || 'Cập nhật cấu hình tìm kiếm';
        } else {
            payload.type = feature.type;
        }

        try {
            handleCustomMutationData({
                method,
                url: endpoint,
                values: payload,
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
                        description: error?.message,
                        message: isDraft ? 'Khởi tạo cấu hình thất bại' : 'Lưu cấu hình thất bại',
                    };
                },
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getDifferenceText = (fieldKey: string): string | null => {
        if (!isViewingHistory) return null;

        if (fieldKey === 'service') {
            const currentService = feature.service || ScraperServiceEnum.GENERIC;
            const snapshotService = selectedVersion?.config?.service || ScraperServiceEnum.GENERIC;
            return currentService !== snapshotService ? `Hiện tại: ${currentService}` : null;
        }

        const currentConfig = (feature.config || {}) as Record<string, any>;
        const snapshotConfig = (selectedVersion?.config || {}) as Record<string, any>;

        const currentVal = currentConfig[fieldKey];
        const snapshotVal = snapshotConfig[fieldKey];

        if (currentVal === snapshotVal) return null;

        if (typeof currentVal === 'boolean' || typeof snapshotVal === 'boolean') {
            return Boolean(currentVal) !== Boolean(snapshotVal)
                ? currentVal
                    ? 'Hiện tại: Bật'
                    : 'Hiện tại: Tắt'
                : null;
        }

        if (currentVal === undefined && snapshotVal === undefined) return null;

        return currentVal ? `Hiện tại: ${currentVal}` : 'Hiện tại: Trống';
    };

    const renderLabel = (label: string, fieldKey: string) => {
        const diffText = getDifferenceText(fieldKey);
        if (!diffText) return label;

        return (
            <CustomFlex align="center" gap="small">
                <span>{label}</span>
                <CustomTag color="warning" className="text-[10px] px-1.5 py-0 font-normal m-0">
                    {diffText}
                </CustomTag>
            </CustomFlex>
        );
    };

    return (
        <CustomForm form={form} layout="vertical" onFinish={handleSave}>
            <CustomFlex vertical gap="middle" className="w-full">
                {/* Search URL Pattern & Query Placeholder */}
                <CustomFlex
                    vertical
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                >
                    <CustomFlex align="center" gap="small" className="mb-3">
                        <Icon icon="lucide:search" className="text-hub-primary shrink-0" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Cấu hình đường dẫn tìm kiếm
                        </CustomTypography.Text>
                    </CustomFlex>
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
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mẫu URL tìm kiếm',
                                    },
                                ]}
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
                </CustomFlex>

                {/* Selectors */}
                <CustomFlex
                    vertical
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                >
                    <CustomFlex align="center" gap="small" className="mb-3">
                        <Icon icon="lucide:sliders" className="text-hub-primary shrink-0" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Bộ chọn (Selectors) & Tùy chọn
                        </CustomTypography.Text>
                    </CustomFlex>
                    <CustomRow gutter={[16, 12]}>
                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="mainContentSelector"
                                label={renderLabel(
                                    'Selector vùng chứa kết quả',
                                    'mainContentSelector',
                                )}
                            >
                                <CustomInput placeholder="Ví dụ: #search-results, .products-grid" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="resultSelector"
                                label={renderLabel(
                                    'Selector từng phần tử kết quả',
                                    'resultSelector',
                                )}
                            >
                                <CustomInput placeholder="Ví dụ: .product-item, article.card" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24}>
                            <CustomFlex
                                align="center"
                                justify="space-between"
                                className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                            >
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    {renderLabel('Lấy phần tử cha', 'isGetParentElement')}
                                </CustomTypography.Text>
                                <CustomForm.Item
                                    name="isGetParentElement"
                                    valuePropName="checked"
                                    noStyle
                                >
                                    <CustomSwitch />
                                </CustomForm.Item>
                            </CustomFlex>
                        </CustomCol>
                    </CustomRow>
                </CustomFlex>

                {/* Function Generator code */}
                <CustomFlex
                    vertical
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                >
                    <CustomFlex align="center" gap="small" className="mb-3">
                        <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            {renderLabel(
                                'Mã nguồn Hàm Tìm kiếm (functionGenerator)',
                                'functionGenerator',
                            )}
                        </CustomTypography.Text>
                    </CustomFlex>
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
                </CustomFlex>

                {/* Change Log */}
                {!isDraft && (
                    <CustomFlex
                        vertical
                        className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                    >
                        <CustomFlex align="center" gap="small" className="mb-2">
                            <Icon icon="lucide:file-text" className="text-hub-primary shrink-0" />
                            <CustomTypography.Text strong className="text-sm text-hub-title">
                                Mô tả thay đổi phiên bản (Change Log)
                            </CustomTypography.Text>
                        </CustomFlex>
                        <CustomForm.Item name="changeDescription" className="!mb-0">
                            <CustomInput placeholder="Ví dụ: Cập nhật URL pattern tìm kiếm mới..." />
                        </CustomForm.Item>
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomForm>
    );
};
