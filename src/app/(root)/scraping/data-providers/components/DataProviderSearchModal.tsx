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
    CustomModal,
    CustomRow,
    CustomSwitch,
    CustomTabs,
} from '@/components/custom-antd';
import { DEFAULT_HTML_CONTENT_STRING, DEFAULT_SEARCH_FUNCTION_GENERATOR } from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { DataProviderSearchStatus, MessageType, NotificationType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import type { NBaseApi, NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';

import type { DataProviderRecord } from '@/app/(root)/scraping/data-providers/types';
import { TestConfigTab } from './TestConfigTab';

export interface DataProviderSearchModalProps {
    open: boolean;
    record: DataProviderRecord | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DataProviderSearchModal: FC<DataProviderSearchModalProps> = ({
    open,
    record,
    onClose,
    onSuccess,
}: DataProviderSearchModalProps): JSX.Element => {
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
    const functionGenerator = CustomForm.useWatch(['searchConfig', 'functionGenerator'], form);

    useEffect((): void => {
        if (open && record) {
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
                enableSearch: record.searchStatus === DataProviderSearchStatus.READY,
                testUrl: initialSearchConfig.searchUrlPattern || record.baseUrl || '',
                htmlContentString: DEFAULT_HTML_CONTENT_STRING,
            });
            setTestResultData(null);
            setActiveTab('config');
        } else {
            form.resetFields();
            setTestResultData(null);
        }
    }, [open, record, form]);

    const handleTestSearch = async (): Promise<void> => {
        if (!testUrl && !htmlContentString) {
            handleNotification({
                type: NotificationType.ERROR,
                message: 'Vui lòng nhập URL hoặc từ khóa để thử nghiệm',
            });
            return;
        }

        setIsLoading(true);

        try {
            const values = await form.validateFields();
            const payload = {
                searchService: record?.searchService || record?.scraperService || 'generic',
                baseUrl: record?.baseUrl || '',
                searchQuery: values.testUrl || 'ao-thun',
                searchConfig: values.searchConfig,
            };

            handleCustomMutationData({
                url: 'data-providers/test-search-function',
                values: payload,
                successNotification: (data) => {
                    setIsLoading(false);
                    const response = data?.data as NBaseApi.IResponse<
                        NDataProvider.IDataProviderItem & Record<string, unknown>
                    >;

                    if (!response?.data) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Thử nghiệm hàm tìm kiếm thất bại',
                            description: response?.errorMessage ?? 'Không lấy được dữ liệu',
                        };
                    }

                    setTestResultData(response.data);
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Thử nghiệm hàm tìm kiếm thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsLoading(false);
                    return {
                        type: MessageType.ERROR,
                        message: 'Thử nghiệm hàm tìm kiếm thất bại',
                        description: error?.message ?? 'Đã xảy ra lỗi khi thử nghiệm',
                    };
                },
            });
        } catch (error) {
            setIsLoading(false);
            console.error('Validation error in test search:', error);
        }
    };

    const handleSaveSearchConfig = async (): Promise<void> => {
        if (!record?.id) return;

        try {
            const values = await form.validateFields();
            const payload = {
                searchConfig: values.searchConfig,
                enableSearch: values.enableSearch ?? true,
            };

            setIsSaving(true);
            handleCustomMutationData({
                method: 'put',
                url: `data-providers/${record.id}/search-config`,
                values: payload,
                successNotification: (data) => {
                    setIsSaving(false);
                    if (data?.data?.isSuccess === false) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Cập nhật cấu hình tìm kiếm thất bại',
                            description: data?.data?.message,
                        };
                    }

                    onSuccess?.();
                    onClose();
                    return {
                        type: MessageType.SUCCESS,
                        message: 'Cập nhật cấu hình hàm tìm kiếm thành công',
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
            console.error('Save search config error:', error);
        }
    };

    const renderTitle = (): JSX.Element => (
        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold truncate pr-4">
            <Icon icon="lucide:search" className="text-hub-primary text-lg sm:text-xl shrink-0" />
            <span className="truncate">{`Cấu hình hàm tìm kiếm: ${record?.name || ''}`}</span>
        </div>
    );

    const renderFooter = (): JSX.Element => (
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
                onClick={handleSaveSearchConfig}
                icon={<Icon icon="lucide:save" />}
                className="flex-1 sm:flex-none"
            >
                Lưu cấu hình
            </CustomButton>
        </CustomFlex>
    );

    const renderSearchConfigTab = (): JSX.Element => (
        <div className="space-y-4">
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
                    <CustomCol xs={24} sm={8}>
                        <CustomForm.Item
                            name={['searchConfig', 'maxResults']}
                            label="Số kết quả tối đa (trang đầu)"
                            className="!mb-0"
                        >
                            <CustomInputNumber min={1} className="w-full" placeholder="10" />
                        </CustomForm.Item>
                    </CustomCol>

                    <CustomCol xs={24} sm={8}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
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

                    <CustomCol xs={24} sm={8}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-hub-card border border-hub-border/50">
                            <span className="text-sm text-hub-title font-medium">
                                Kích hoạt tìm kiếm (enableSearch)
                            </span>
                            <CustomForm.Item name="enableSearch" valuePropName="checked" noStyle>
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
                        onCodeChange={(newCode: string): void => {
                            form.setFieldValue(['searchConfig', 'functionGenerator'], newCode);
                        }}
                    />
                </CustomForm.Item>
            </div>
        </div>
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
            children: renderSearchConfigTab(),
        },
        {
            key: 'test',
            label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Icon icon="lucide:flask-conical" className="shrink-0" />
                    <span>Thử nghiệm</span>
                </span>
            ),
            children: (
                <TestConfigTab
                    form={form}
                    title="Thử nghiệm hàm tìm kiếm (Test Search)"
                    inputLabel="URL / Keyword thử nghiệm"
                    isLoading={isLoading}
                    isTestHtmlContent={isTestHtmlContent}
                    testResultData={testResultData}
                    htmlContentString={htmlContentString}
                    onTestHtmlContentChange={setIsTestHtmlContent}
                    onTestParser={handleTestSearch}
                />
            ),
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
                    onChange={(key: string): void => setActiveTab(key)}
                    className="[&_.ant-tabs-nav]:sticky [&_.ant-tabs-nav]:top-0 [&_.ant-tabs-nav]:z-10 [&_.ant-tabs-nav]:bg-hub-surface [&_.ant-tabs-nav]:!mb-4 [&_.ant-tabs-nav]:py-2 [&_.ant-tabs-nav-list]:w-full [&_.ant-tabs-tab]:flex-1 [&_.ant-tabs-tab]:justify-center"
                />
            </CustomForm>
        </CustomModal>
    );
};
