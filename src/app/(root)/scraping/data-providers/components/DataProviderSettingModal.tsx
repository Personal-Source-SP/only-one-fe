'use client';

import { CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomCard,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
    CustomRow,
    CustomSelect,
    CustomSwitch,
    CustomTabs,
    CustomTypography,
} from '@/components/custom-antd';
import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_HTML_CONTENT_STRING,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { MessageType, NotificationType, ScraperServiceEnum } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import type { NBaseApi, NDataProvider } from '@/interfaces';
import type { DataProviderRecord } from '@/app/(root)/scraping/data-providers/types';
import { Icon } from '@iconify/react';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';

export type SettingConfigType = 'target' | 'search';

interface DataProviderSettingModalProps {
    open: boolean;
    configType?: SettingConfigType;
    record: DataProviderRecord | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DataProviderSettingModal = ({
    open,
    configType = 'target',
    record,
    onClose,
    onSuccess,
}: DataProviderSettingModalProps) => {
    const { handleNotification } = useMainContext();
    const { handleCustomMutationData } = useCustomMutationData();

    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('config');
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [testResultData, setTestResultData] = useState<Record<string, unknown> | null>(null);

    const testUrl = CustomForm.useWatch('testUrl', form);
    const htmlContentString = CustomForm.useWatch('htmlContentString', form);

    const functionGeneratorField =
        configType === 'search'
            ? ['searchConfig', 'functionGenerator']
            : ['targetConfig', 'functionGenerator'];
    const functionGenerator = CustomForm.useWatch(functionGeneratorField, form);

    useEffect(() => {
        if (open && record) {
            if (configType === 'search') {
                const initialSearchConfig = record.searchConfig ?? {
                    searchUrlPattern: `${record.baseUrl || ''}/search?q={query}`,
                    queryPlaceholder: '{query}',
                    mainContentSelector: '',
                    resultSelector: '',
                    maxResults: 10,
                    isGetParentElement: false,
                    functionGenerator: DEFAULT_SEARCH_FUNCTION_GENERATOR,
                };

                form.setFieldsValue({
                    searchConfig: initialSearchConfig,
                    testUrl: initialSearchConfig.searchUrlPattern || record.baseUrl || '',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                });
            } else {
                const initialTargetConfig = record.targetConfig ?? {
                    maxResults: 10,
                    retryDelay: 1000,
                    retryAttempts: 3,
                    mainContentSelector: '',
                    isGetParentElement: false,
                    functionGenerator:
                        record.scraperService === ScraperServiceEnum.GENERIC
                            ? DEFAULT_PARSER_FUNCTION_GENERATOR
                            : DEFAULT_API_FUNCTION_GENERATOR,
                };

                form.setFieldsValue({
                    scraperService: record.scraperService || ScraperServiceEnum.API,
                    targetConfig: initialTargetConfig,
                    testUrl: record.baseUrl || '',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                });
            }
            setTestResultData(null);
            setActiveTab('config');
        } else {
            form.resetFields();
            setTestResultData(null);
        }
    }, [open, record, configType, form]);

    const handleScraperServiceChange = (value: ScraperServiceEnum) => {
        if (configType === 'search') return;
        const currentGenerator = form.getFieldValue(['targetConfig', 'functionGenerator']);
        if (isEmpty(currentGenerator)) {
            if (value === ScraperServiceEnum.GENERIC) {
                form.setFieldValue(
                    ['targetConfig', 'functionGenerator'],
                    DEFAULT_PARSER_FUNCTION_GENERATOR,
                );
            } else if (value === ScraperServiceEnum.API) {
                form.setFieldValue(
                    ['targetConfig', 'functionGenerator'],
                    DEFAULT_API_FUNCTION_GENERATOR,
                );
            }
        }
    };

    const handleTestParser = async () => {
        if (!testUrl && !htmlContentString) {
            handleNotification({
                type: NotificationType.ERROR,
                message: 'Vui lòng nhập URL hoặc nội dung HTML để thử nghiệm',
            });
            return;
        }

        setIsLoading(true);

        try {
            const values = await form.validateFields();
            const isSearch = configType === 'search';
            const endpoint = isSearch
                ? 'parsers/test-search-function'
                : 'parsers/test-parser-function';

            const payload = isSearch
                ? {
                      ...values.searchConfig,
                      url: values.testUrl,
                      htmlContentString: isTestHtmlContent ? values.htmlContentString : undefined,
                  }
                : {
                      ...values.targetConfig,
                      url: values.testUrl,
                      htmlContentString: isTestHtmlContent ? values.htmlContentString : undefined,
                      scraperService: values.scraperService,
                  };

            handleCustomMutationData({
                url: endpoint,
                values: payload,
                successNotification: (data) => {
                    setIsLoading(false);
                    const response = data?.data as NBaseApi.IResponse<
                        NDataProvider.IDataProviderItem & Record<string, unknown>
                    >;

                    if (!response?.data) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Thử nghiệm hàm thất bại',
                            description: response?.errorMessage ?? 'Không lấy được dữ liệu',
                        };
                    }

                    setTestResultData(response.data);
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm hàm thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsLoading(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Thử nghiệm hàm thất bại',
                        description: error?.message ?? 'Đã xảy ra lỗi khi thử nghiệm',
                    };
                },
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Validation error in test parser:', error);
        }
    };

    const handleSaveConfig = async () => {
        if (!record?.id) return;

        try {
            const values = await form.validateFields();
            const isSearch = configType === 'search';

            const endpoint = isSearch
                ? `data-providers/${record.id}/search-config`
                : `data-providers/${record.id}/target-config`;

            const payload = isSearch
                ? values.searchConfig
                : {
                      ...values.targetConfig,
                      scraperService: values.scraperService,
                  };

            setIsSaving(true);
            handleCustomMutationData({
                method: 'put',
                url: endpoint,
                values: payload,
                successNotification: (data) => {
                    setIsSaving(false);
                    if (data?.data?.isSuccess === false) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Cập nhật cấu hình thất bại',
                            description: data?.data?.message,
                        };
                    }

                    onSuccess?.();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: isSearch
                            ? 'Cập nhật cấu hình hàm tìm kiếm thành công'
                            : 'Cập nhật cấu hình hàm cào thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsSaving(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Cập nhật cấu hình thất bại',
                        description: error?.message ?? 'Không thể lưu cấu hình',
                    };
                },
            });
        } catch (error) {
            setIsSaving(false);
            console.error('Save target config error:', error);
        }
    };

    const renderTargetConfigFields = () => (
        <>
            {/* Thông số cơ bản */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                    <span>Cấu hình chung & Selectors</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name="scraperService"
                            label="Dịch vụ Scraper"
                            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ scraper' }]}
                            className="!mb-0"
                        >
                            <CustomSelect
                                placeholder="Chọn dịch vụ scraper"
                                onChange={handleScraperServiceChange}
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
                            name={['targetConfig', 'mainContentSelector']}
                            label="Selector nội dung chính"
                            className="!mb-0"
                        >
                            <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name={['targetConfig', 'waitForSelector']}
                            label="Selector chờ (Wait for selector)"
                            className="!mb-0"
                        >
                            <CustomInput placeholder="Ví dụ: .price-tag, #loaded" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name={['targetConfig', 'userAgent']}
                            label="User Agent tùy chỉnh"
                            className="!mb-0"
                        >
                            <CustomInput placeholder="Mozilla/5.0..." />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Giới hạn & Thử lại */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:repeat" className="text-hub-primary shrink-0" />
                    <span>Giới hạn & Thử lại</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name={['targetConfig', 'maxResults']}
                            label="Số kết quả tối đa"
                            className="!mb-0"
                        >
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name={['targetConfig', 'retryDelay']}
                            label="Delay retry (ms)"
                            className="!mb-0"
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="1000" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name={['targetConfig', 'retryAttempts']}
                            label="Số lần thử lại"
                            className="!mb-0"
                        >
                            <CustomInputNumber min={0} className="w-full" placeholder="3" />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Tùy chọn nâng cao (Switches) */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
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
                                name={['targetConfig', 'isGetParentElement']}
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
                            <CustomForm.Item
                                name={['targetConfig', 'stealthMode']}
                                valuePropName="checked"
                                noStyle
                            >
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
                                name={['targetConfig', 'cloudflareBypass']}
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </div>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Code Parser */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                    <span>Mã nguồn Hàm Parser (functionGenerator)</span>
                </h4>
                <CustomForm.Item
                    name={['targetConfig', 'functionGenerator']}
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung hàm parser' }]}
                    className="!mb-0"
                >
                    <CodeDisplay
                        isDisplayLanguage
                        language="javascript"
                        code={functionGenerator || ''}
                        onCodeChange={(newCode: string) => {
                            form.setFieldValue(['targetConfig', 'functionGenerator'], newCode);
                        }}
                    />
                </CustomForm.Item>
            </div>
        </>
    );

    const renderSearchConfigFields = () => (
        <>
            {/* Cấu hình URL Tìm kiếm & Selectors */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:search" className="text-hub-primary shrink-0" />
                    <span>Mẫu URL Tìm kiếm & Selectors</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} md={16}>
                        <CustomForm.Item
                            name={['searchConfig', 'searchUrlPattern']}
                            label="URL Mẫu Tìm kiếm (searchUrlPattern)"
                            rules={[{ required: true, message: 'Vui lòng nhập URL mẫu tìm kiếm' }]}
                            className="!mb-0"
                        >
                            <CustomInput placeholder="https://shopee.vn/search?keyword={query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={8}>
                        <CustomForm.Item
                            name={['searchConfig', 'queryPlaceholder']}
                            label="Query Placeholder"
                            rules={[{ required: true, message: 'Vui lòng nhập query placeholder' }]}
                            className="!mb-0"
                        >
                            <CustomInput placeholder="{query}" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name={['searchConfig', 'mainContentSelector']}
                            label="Selector khung kết quả chính"
                            rules={[{ required: true, message: 'Vui lòng nhập selector chính' }]}
                            className="!mb-0"
                        >
                            <CustomInput placeholder=".shopee-search-item-result" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} md={12}>
                        <CustomForm.Item
                            name={['searchConfig', 'resultSelector']}
                            label="Selector từng sản phẩm (resultSelector)"
                            rules={[{ required: true, message: 'Vui lòng nhập result selector' }]}
                            className="!mb-0"
                        >
                            <CustomInput placeholder=".shopee-search-item-result__item" />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Giới hạn & Tùy chọn */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:sliders" className="text-hub-primary shrink-0" />
                    <span>Giới hạn kết quả & Tùy chọn</span>
                </h4>
                <CustomRow gutter={[16, 12]}>
                    <CustomCol xs={24} sm={12}>
                        <CustomForm.Item
                            name={['searchConfig', 'maxResults']}
                            label="Số kết quả tối đa (trang đầu)"
                            className="!mb-0"
                        >
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={12}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50 mt-6">
                            <span className="text-sm text-hub-title font-medium">
                                Lấy phần tử cha (isGetParentElement)
                            </span>
                            <CustomForm.Item
                                name={['searchConfig', 'isGetParentElement']}
                                valuePropName="checked"
                                noStyle
                            >
                                <CustomSwitch />
                            </CustomForm.Item>
                        </div>
                    </CustomCol>
                </CustomRow>
            </div>

            {/* Code Search Parser */}
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:code-2" className="text-hub-primary shrink-0" />
                    <span>Mã nguồn Hàm Tìm kiếm (functionGenerator)</span>
                </h4>
                <CustomForm.Item
                    name={['searchConfig', 'functionGenerator']}
                    rules={[{ required: true, message: 'Vui lòng nhập hàm tìm kiếm' }]}
                    className="!mb-0"
                >
                    <CodeDisplay
                        isDisplayLanguage
                        language="javascript"
                        code={functionGenerator || ''}
                        onCodeChange={(newCode: string) => {
                            form.setFieldValue(['searchConfig', 'functionGenerator'], newCode);
                        }}
                    />
                </CustomForm.Item>
            </div>
        </>
    );

    const renderConfigTab = () => (
        <div className="space-y-4">
            {configType === 'search' ? renderSearchConfigFields() : renderTargetConfigFields()}
        </div>
    );

    const renderTestTab = () => (
        <div className="space-y-4">
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:flask-conical" className="text-hub-primary shrink-0" />
                    <span>
                        {configType === 'search'
                            ? 'Thử nghiệm hàm tìm kiếm (Test Search)'
                            : 'Thử nghiệm hàm cào (Test Parser)'}
                    </span>
                </h4>

                <CustomForm.Item
                    name="testUrl"
                    label={configType === 'search' ? 'URL / Keyword thử nghiệm' : 'URL thử nghiệm'}
                    className="!mb-3"
                >
                    <CustomInput placeholder="https://shopee.vn/search?keyword=ao-thun" />
                </CustomForm.Item>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <CustomSwitch
                            checked={isTestHtmlContent}
                            onChange={(checked) => setIsTestHtmlContent(checked)}
                        />
                        <span className="text-sm text-hub-muted">
                            Sử dụng HTML content mẫu thay cho URL
                        </span>
                    </div>

                    <CustomButton
                        type="primary"
                        loading={isLoading}
                        onClick={handleTestParser}
                        icon={<Icon icon="lucide:play" />}
                        className="w-full sm:w-auto"
                    >
                        Chạy thử nghiệm
                    </CustomButton>
                </div>

                {isTestHtmlContent && (
                    <CustomForm.Item
                        name="htmlContentString"
                        label="Nội dung HTML mẫu"
                        className="!mb-0 mt-3"
                    >
                        <CodeDisplay
                            expanded
                            language="html"
                            code={htmlContentString || ''}
                            onCodeChange={(newCode: string) => {
                                form.setFieldValue('htmlContentString', newCode);
                            }}
                        />
                    </CustomForm.Item>
                )}
            </div>

            {testResultData && (
                <CustomCard className="border-hub-border bg-hub-section/20 shadow-xs rounded-xl">
                    <CustomTypography.Title level={5} className="!mb-3 flex items-center gap-2">
                        <Icon icon="lucide:check-circle-2" className="text-emerald-500 shrink-0" />
                        <span>Kết quả trích xuất:</span>
                    </CustomTypography.Title>
                    <CodeDisplay
                        isDisplayLanguage
                        language="json"
                        title="Dữ liệu kết quả"
                        code={JSON.stringify(testResultData, null, 2)}
                    />
                </CustomCard>
            )}
        </div>
    );

    const renderTitle = () => {
        const titleText =
            configType === 'search'
                ? `Cấu hình hàm tìm kiếm: ${record?.name || ''}`
                : `Cấu hình hàm cào: ${record?.name || ''}`;
        const iconName = configType === 'search' ? 'lucide:search' : 'lucide:code-2';

        return (
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold truncate pr-4">
                <Icon icon={iconName} className="text-hub-primary text-lg sm:text-xl shrink-0" />
                <span className="truncate">{titleText}</span>
            </div>
        );
    };

    const renderFooter = () => (
        <CustomFlex justify="end" gap={8} className="w-full flex-row">
            <CustomButton
                onClick={onClose}
                disabled={isSaving || isLoading}
                className="flex-1 sm:flex-none"
            >
                Hủy
            </CustomButton>
            <CustomButton
                type="primary"
                loading={isSaving}
                disabled={isLoading}
                onClick={handleSaveConfig}
                icon={<Icon icon="lucide:save" />}
                className="flex-1 sm:flex-none"
            >
                Lưu cấu hình
            </CustomButton>
        </CustomFlex>
    );

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Icon icon="lucide:sliders-horizontal" className="shrink-0" />
                    <span>Cấu hình & Script</span>
                </span>
            ),
            children: renderConfigTab(),
        },
        {
            key: 'test',
            label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Icon icon="lucide:flask-conical" className="shrink-0" />
                    <span>Thử nghiệm</span>
                </span>
            ),
            children: renderTestTab(),
        },
    ];

    return (
        <CustomModal
            zIndex={1100}
            modalProps={{
                open,
                width: 920,
                onCancel: onClose,
                title: renderTitle(),
                footer: renderFooter(),
            }}
        >
            <CustomForm form={form} layout="vertical" className="pt-1 pb-2">
                <CustomTabs
                    items={tabItems}
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    className="[&_.ant-tabs-nav]:sticky [&_.ant-tabs-nav]:top-0 [&_.ant-tabs-nav]:z-10 [&_.ant-tabs-nav]:bg-hub-surface [&_.ant-tabs-nav]:!mb-4 [&_.ant-tabs-nav]:py-2 [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center"
                />
            </CustomForm>
        </CustomModal>
    );
};
