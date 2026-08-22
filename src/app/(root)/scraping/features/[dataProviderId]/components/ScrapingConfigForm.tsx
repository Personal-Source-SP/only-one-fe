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
import { DEFAULT_API_FUNCTION_GENERATOR, DEFAULT_PARSER_FUNCTION_GENERATOR } from '@/constants';
import { MessageType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { Icon } from '@iconify/react';
import type { IConfigVersion, IDataProviderFeature } from '../types';

type ScrapingConfigFormProps = {
    feature: IDataProviderFeature;
    form?: FormInstance;
    isViewingHistory?: boolean;
    selectedVersion?: IConfigVersion | null;
    onClose: () => void;
    onSuccess: () => void;
    setIsSaving?: (loading: boolean) => void;
};

export const ScrapingConfigForm = ({
    feature,
    form: externalForm,
    isViewingHistory,
    selectedVersion,
    onClose,
    onSuccess,
    setIsSaving: externalSetIsSaving,
}: ScrapingConfigFormProps) => {
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
    }, [feature, selectedVersion, form]);

    const handleServiceChange = (service: string) => {
        switch (service) {
            case ScraperServiceEnum.API:
                form.setFieldValue('functionGenerator', DEFAULT_API_FUNCTION_GENERATOR);
                break;
            case ScraperServiceEnum.GENERIC:
                form.setFieldValue('functionGenerator', DEFAULT_PARSER_FUNCTION_GENERATOR);
                break;
            default:
                break;
        }
    };

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
            payload.changeDescription = changeDescription || 'Cập nhật cấu hình cào';
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
                            ? 'Khởi tạo và lưu cấu hình cào thành công'
                            : 'Lưu cấu hình cào thành công',
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
                {/* General & Selectors */}
                <CustomFlex
                    vertical
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                >
                    <CustomFlex align="center" gap="small" className="mb-3">
                        <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Cấu hình chung & Selectors
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
                            <CustomForm.Item
                                name="mainContentSelector"
                                label={renderLabel(
                                    'Selector nội dung chính',
                                    'mainContentSelector',
                                )}
                            >
                                <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="waitForSelector"
                                label={renderLabel(
                                    'Selector chờ (Wait for selector)',
                                    'waitForSelector',
                                )}
                            >
                                <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24} md={12}>
                            <CustomForm.Item
                                name="userAgent"
                                label={renderLabel('User Agent tùy chỉnh', 'userAgent')}
                            >
                                <CustomInput placeholder="Mozilla/5.0..." />
                            </CustomForm.Item>
                        </CustomCol>
                    </CustomRow>
                </CustomFlex>

                {/* Limits & Retry */}
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
                        <CustomCol xs={24} sm={8}>
                            <CustomForm.Item
                                name="maxResults"
                                label={renderLabel('Số kết quả tối đa', 'maxResults')}
                            >
                                <CustomInputNumber min={1} className="w-full" placeholder="10" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24} sm={8}>
                            <CustomForm.Item
                                name="retryDelay"
                                label={renderLabel('Delay retry (ms)', 'retryDelay')}
                            >
                                <CustomInputNumber min={0} className="w-full" placeholder="1000" />
                            </CustomForm.Item>
                        </CustomCol>

                        <CustomCol xs={24} sm={8}>
                            <CustomForm.Item
                                name="retryAttempts"
                                label={renderLabel('Số lần thử lại', 'retryAttempts')}
                            >
                                <CustomInputNumber min={0} className="w-full" placeholder="3" />
                            </CustomForm.Item>
                        </CustomCol>
                    </CustomRow>
                </CustomFlex>

                {/* Advanced switches */}
                <CustomFlex
                    vertical
                    className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-4"
                >
                    <CustomFlex align="center" gap="small" className="mb-3">
                        <Icon icon="lucide:shield-check" className="text-hub-primary shrink-0" />
                        <CustomTypography.Text strong className="text-sm text-hub-title">
                            Tùy chọn nâng cao
                        </CustomTypography.Text>
                    </CustomFlex>
                    <CustomRow gutter={[12, 12]}>
                        <CustomCol xs={24} sm={8}>
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

                        <CustomCol xs={24} sm={8}>
                            <CustomFlex
                                align="center"
                                justify="space-between"
                                className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                            >
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    {renderLabel('Stealth Mode', 'stealthMode')}
                                </CustomTypography.Text>
                                <CustomForm.Item name="stealthMode" valuePropName="checked" noStyle>
                                    <CustomSwitch />
                                </CustomForm.Item>
                            </CustomFlex>
                        </CustomCol>

                        <CustomCol xs={24} sm={8}>
                            <CustomFlex
                                align="center"
                                justify="space-between"
                                className="p-3 rounded-lg bg-hub-card border border-hub-border/50"
                            >
                                <CustomTypography.Text className="text-sm text-hub-title font-medium">
                                    {renderLabel('Vượt Cloudflare', 'cloudflareBypass')}
                                </CustomTypography.Text>
                                <CustomForm.Item
                                    name="cloudflareBypass"
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
                                'Mã nguồn Hàm Parser (functionGenerator)',
                                'functionGenerator',
                            )}
                        </CustomTypography.Text>
                    </CustomFlex>
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
                </CustomFlex>

                {/* Change Log description (shown when editing existing feature) */}
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
                            <CustomInput placeholder="Ví dụ: Cập nhật selector giá mới theo layout..." />
                        </CustomForm.Item>
                    </CustomFlex>
                )}
            </CustomFlex>
        </CustomForm>
    );
};
