'use client';

import { StatusTag } from '@/components/common';
import { CustomFormModal, CustomSelect } from '@/components/custom';
import CodeDisplay from '@/components/module/code-display';
import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_HTML_CONTENT_STRING,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
} from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { DataProviderStatus, ScraperServiceEnum } from '@/enums';
import { useCustomModal, useCustomMutationData } from '@/hooks';
import { NBaseApi, NDataProvider, Option } from '@/interfaces';
import {
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    Row,
    Select,
    Space,
    Switch,
    Typography,
} from 'antd';
import { useWatch } from 'antd/es/form/Form';
import { isEmpty, isNumber } from 'lodash';
import { Fragment, useState } from 'react';
import ScrapeFormItem from './ScrapeFormItem';

type DataProviderForm = NDataProvider.IDataProvider & {
    url: string;
    extractData: Record<string, any>;
    additionalUrls?: string[];
    screenShotImage?: string;
};

type ScrapeSettingProps = {
    modalPropsData: ReturnType<typeof useCustomModal>;
    dataProviderItemOptions: Option[];
    onClose: () => void;
};

export const FORM_FIELDS = {
    SCRAPER_SERVICE: 'scraperService',

    IS_GET_PARENT_ELEMENT: 'isGetParentElement',
    MAIN_CONTENT_SELECTOR: 'mainContentSelector',

    QUERY_PARAMS: 'queryParams',
    FIRST_QUERY_PARAM: 'firstQueryParams',

    MAX_RESULTS: 'maxResults',
    RETRY_DELAY: 'retryDelay',
    RETRY_ATTEMPTS: 'retryAttempts',
    USER_AGENT: 'userAgent',
    HEADERS: 'headers',
    COOKIES: 'cookies',

    STEALTH_MODE: 'stealthMode',
    CLOUDFLARE_BYPASS: 'cloudflareBypass',
    WAIT_FOR_SELECTOR: 'waitForSelector',
    JAVASCRIPT_ENABLED: 'javascriptEnabled',
    IMAGES_ENABLED: 'imagesEnabled',
    CSS_ENABLED: 'cssEnabled',

    URL: 'url',
    FUNCTION_GENERATOR: 'functionGenerator',

    EXTRACT_DATA: 'extractData',
    PROCESSING_TIME: 'processingTime',
    HTML_CONTENT_STRING: 'htmlContentString',
    ADDITIONAL_URLS: 'additionalUrls',
    ADDITIONAL_EXTRACT_DATA: 'additionalExtractData',
};

const ScrapeSetting = ({
    modalPropsData,
    dataProviderItemOptions,
    onClose,
}: ScrapeSettingProps) => {
    const { handleNotification } = useMainContext();
    const { formProps, modalProps, formLoading } = modalPropsData;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);

    const form = formProps?.form;
    const dataProvider = formProps?.initialValues;
    const isParentProvider = dataProvider?.parentId ? false : true;

    const url = useWatch([FORM_FIELDS.URL], { form, preserve: true });
    const formUrls = useWatch([FORM_FIELDS.ADDITIONAL_URLS], { form, preserve: true });
    const extractData = useWatch([FORM_FIELDS.EXTRACT_DATA], { form, preserve: true });
    const scraperService = useWatch([FORM_FIELDS.SCRAPER_SERVICE], { form, preserve: true });
    const processingTime = useWatch([FORM_FIELDS.PROCESSING_TIME], { form, preserve: true });
    const htmlContentString = useWatch([FORM_FIELDS.HTML_CONTENT_STRING], { form, preserve: true });
    const additionalExtractData = useWatch([FORM_FIELDS.ADDITIONAL_EXTRACT_DATA], {
        form,
        preserve: true,
    });

    const headers = useWatch(['targetConfig', FORM_FIELDS.HEADERS], { form, preserve: true });
    const cookies = useWatch(['targetConfig', FORM_FIELDS.COOKIES], { form, preserve: true });
    const functionGenerator = useWatch(['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR], {
        form,
        preserve: true,
    });

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData();
    const { handleCustomMutationData: handleCreate } = useCustomMutationData();

    console.log(url, htmlContentString);

    const handleTestParser = async () => {
        if (!url && !htmlContentString) {
            handleNotification({
                type: 'error',
                message: 'URL hoặc HTML content không được để trống',
            });

            return;
        }

        setIsLoading(true);

        try {
            const values = (await form?.validateFields()) as DataProviderForm;

            handleCreate({
                url: 'parsers/test-parser-function',
                values: {
                    ...values.targetConfig,
                    url,
                    htmlContentString,
                    scraperService: values?.scraperService,
                },
                successNotification(data) {
                    const response =
                        data?.data as NBaseApi.IResponse<NDataProvider.IDataProviderItem>;

                    if (!response?.data) {
                        setIsLoading(false);

                        return {
                            type: 'error',
                            message: 'Test parser thất bại',
                            description: response?.errorMessage ?? 'Test parser thất bại',
                        };
                    }

                    setIsLoading(false);
                    form?.setFieldValue([FORM_FIELDS.EXTRACT_DATA], response.data);

                    return {
                        type: 'success',
                        message: 'Test parser thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsLoading(false);

                    return {
                        type: 'error',
                        message: 'Test parser thất bại',
                        description: error?.message ?? 'Test parser thất bại',
                    };
                },
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdateTargetConfig = async (values: DataProviderForm) => {
        const targetConfig = values?.targetConfig as NDataProvider.ITargetConfig | undefined;

        if (isEmpty(targetConfig)) {
            return handleNotification({
                type: 'error',
                message: 'Hàm parser không được để trống',
                description: 'Vui lòng nhập hàm parser',
            });
        }

        const request: NDataProvider.UpdateTargetConfigRequest = {
            ...targetConfig,
            scraperService: values?.scraperService,
        };

        handleUpdate({
            method: 'put',
            values: request,
            url: `data-providers/${dataProvider?.id}/target-config`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    return {
                        type: 'error',
                        message: 'Cập nhật cấu hình dữ liệu thất bại',
                        description: data?.data?.message ?? 'Cập nhật cấu hình dữ liệu thất bại',
                    };
                }

                onClose?.();

                return {
                    type: 'success',
                    message: 'Cập nhật cấu hình dữ liệu thành công',
                };
            },
            errorNotification: () => {
                return {
                    type: 'error',
                    message: 'Cập nhật cấu hình dữ liệu thất bại',
                    description: 'Cập nhật cấu hình dữ liệu thất bại',
                };
            },
        });
    };

    const handleSwitchStatus = (status: DataProviderStatus) => {
        if (!dataProvider?.id) {
            return handleNotification({
                type: 'error',
                message: 'Không thể chuyển trạng thái',
                description: 'Không thể chuyển trạng thái',
            });
        }

        handleUpdate({
            values: {},
            method: 'put',
            url: `data-providers/${dataProvider.id}/switch-status/${status}`,
            successNotification: (data) => {
                if (!data?.data?.isSuccess) {
                    return {
                        type: 'error',
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                onClose();

                return {
                    type: 'success',
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                return {
                    type: 'error',
                    message: 'Chuyển trạng thái thất bại',
                    description: error?.message ?? 'Chuyển trạng thái thất bại',
                };
            },
        });
    };

    const handleCancel = () => {
        form?.setFieldsValue({});
        onClose();
    };

    const renderTitle = () => {
        if (!dataProvider) return <></>;

        return (
            <Flex justify="space-between" align="center">
                <Space size={0}>
                    <span className="mr-1">Cấu hình dữ liệu</span>
                    <span className="mr-2">{`for ${dataProvider.name || dataProvider.baseUrl}`}</span>
                    <StatusTag status={dataProvider?.status} />
                </Space>
            </Flex>
        );
    };

    const renderFooter = () => {
        return (
            <Flex justify="end" align="center" gap={16}>
                {(dataProvider?.status !== DataProviderStatus.UNCONFIGURED ||
                    dataProvider?.parent?.status !== DataProviderStatus.UNCONFIGURED) && (
                    <Button
                        type="primary"
                        disabled={false}
                        onClick={() =>
                            handleSwitchStatus(
                                dataProvider?.status === DataProviderStatus.TESTING
                                    ? DataProviderStatus.READY
                                    : DataProviderStatus.TESTING,
                            )
                        }
                    >
                        Chuyển trạng thái
                    </Button>
                )}

                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!isParentProvider}
                    onClick={() => form?.submit()}
                >
                    Lưu
                </Button>

                <Button onClick={handleCancel}>Hủy</Button>
            </Flex>
        );
    };

    const renderFormUrl = (field: string, index?: number) => {
        if (!dataProviderItemOptions?.length) {
            return <Input disabled={false} placeholder="URL" />;
        }

        return (
            <CustomSelect
                showSearch
                disabled={false}
                options={dataProviderItemOptions}
                onInputChange={(value) => {
                    if (isNumber(index)) {
                        form?.setFieldValue(
                            [field as 'dataProviderItems' | 'additionalUrls', index],
                            value,
                        );
                    } else {
                        form?.setFieldValue(
                            [field as 'dataProviderItems' | 'additionalUrls' | 'url'],
                            value,
                        );
                    }
                }}
            />
        );
    };

    const renderFormTargetConfiguration = () => {
        if (!form) return <></>;

        return (
            <Fragment>
                <Form.Item
                    label="Dịch vụ"
                    name={FORM_FIELDS.SCRAPER_SERVICE}
                    rules={[
                        {
                            required: true,
                            message: 'Dịch vụ cần chọn',
                        },
                    ]}
                >
                    <Select
                        disabled={
                            dataProvider?.status === DataProviderStatus.READY ||
                            dataProvider?.parent?.status === DataProviderStatus.READY
                        }
                        options={[
                            { label: 'API', value: ScraperServiceEnum.API },
                            { label: 'Cục bộ', value: ScraperServiceEnum.LOCAL },
                            { label: 'Cơ bản', value: ScraperServiceEnum.GENERIC },
                        ]}
                        onChange={(value) => {
                            switch (value) {
                                case ScraperServiceEnum.API: {
                                    form?.setFieldValue(
                                        ['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR],
                                        DEFAULT_API_FUNCTION_GENERATOR,
                                    );
                                    break;
                                }

                                case ScraperServiceEnum.GENERIC: {
                                    form?.setFieldValue(
                                        ['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR],
                                        DEFAULT_PARSER_FUNCTION_GENERATOR,
                                    );
                                    break;
                                }

                                default: {
                                    form?.setFieldValue(
                                        ['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR],
                                        undefined,
                                    );
                                    break;
                                }
                            }
                        }}
                    />
                </Form.Item>

                <ScrapeFormItem
                    url={url}
                    form={form}
                    headers={headers}
                    cookies={cookies}
                    formUrls={formUrls}
                    scraperService={scraperService}
                    renderFormUrl={renderFormUrl}
                />
            </Fragment>
        );
    };

    const renderFunctionGenerator = () => {
        if (scraperService === ScraperServiceEnum.LOCAL) {
            return (
                <Flex justify="end" align="center" className="my-2">
                    <Button type="primary" onClick={handleTestParser} disabled={false}>
                        Thử nghiệm hàm
                    </Button>
                </Flex>
            );
        }

        const isFunctionGeneratorEmpty = isEmpty(functionGenerator);
        if (isFunctionGeneratorEmpty) return <></>;

        return (
            <Fragment>
                <Form.Item name={['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR]}>
                    <CodeDisplay
                        isDisplayLanguage
                        language="javascript"
                        code={functionGenerator}
                        processingTime={processingTime}
                        onCodeChange={(newCode: string) => {
                            form?.setFieldValue(
                                ['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR],
                                newCode,
                            );
                        }}
                    />
                </Form.Item>

                <Flex justify="space-between" align="center" className="my-2">
                    <Space>
                        <Switch
                            checked={isTestHtmlContent}
                            onChange={() => setIsTestHtmlContent(!isTestHtmlContent)}
                        />
                        <Typography.Text type="secondary">Sử dụng HTML content</Typography.Text>
                    </Space>
                    <Button type="primary" onClick={handleTestParser} disabled={false}>
                        Thử nghiệm hàm
                    </Button>
                </Flex>

                {isTestHtmlContent && (
                    <Form.Item name={FORM_FIELDS.HTML_CONTENT_STRING}>
                        <CodeDisplay
                            expanded
                            language="html"
                            code={htmlContentString || DEFAULT_HTML_CONTENT_STRING}
                            onCodeChange={(newCode: string) => {
                                form?.setFieldValue([FORM_FIELDS.HTML_CONTENT_STRING], newCode);
                            }}
                        />
                    </Form.Item>
                )}
            </Fragment>
        );
    };

    const renderExtractData = () => {
        if (isEmpty(extractData)) return <></>;

        return (
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={8}>
                            <Typography.Text type="secondary">Giá:</Typography.Text>
                            <Typography.Title level={2}>
                                {extractData?.productPrice}
                            </Typography.Title>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={8}>
                            <Typography.Text type="secondary">Tiền tệ:</Typography.Text>
                            <Typography.Title level={2}>
                                {dataProvider?.expectedCurrency}
                            </Typography.Title>
                        </Space>
                    </Col>
                </Row>

                <Divider />

                <div className="space-y-3">
                    <Form.Item name={FORM_FIELDS.EXTRACT_DATA}>
                        <CodeDisplay
                            isDisplayLanguage
                            title="Dữ liệu metadata"
                            code={JSON.stringify(extractData)}
                        />
                        {!isEmpty(additionalExtractData) &&
                            additionalExtractData?.map(
                                (item: Record<string, any>, index: number) => (
                                    <div key={item.productName} className="mt-2">
                                        <CodeDisplay
                                            isDisplayLanguage
                                            key={item.productName}
                                            code={JSON.stringify(item)}
                                            title={`Dữ liệu bổ sung - ${formUrls?.[index]}`}
                                        />
                                    </div>
                                ),
                            )}
                    </Form.Item>
                </div>
            </Card>
        );
    };

    return (
        <CustomFormModal
            formLoading={formLoading || isLoading}
            modalProps={{
                ...modalProps,
                width: 900,
                centered: true,
                title: renderTitle(),
                loading: formLoading,
                footer: renderFooter(),
                onCancel: handleCancel,
                open: modalPropsData?.open,
            }}
        >
            <Form
                {...formProps}
                layout="vertical"
                disabled={!isParentProvider}
                className="[&_.ant-form-item]:!mb-2"
                onFinish={(values) => handleUpdateTargetConfig(values as DataProviderForm)}
                initialValues={
                    isEmpty(formProps?.initialValues?.targetConfig)
                        ? {
                              scraperService: ScraperServiceEnum.API,
                              targetConfig: {
                                  maxResults: 10,
                                  retryDelay: 1000,
                                  retryAttempts: 3,
                                  mainContentSelector: '',
                                  isGetParentElement: false,
                                  functionGenerator: DEFAULT_API_FUNCTION_GENERATOR,
                              },
                          }
                        : formProps?.initialValues
                }
            >
                {renderFormTargetConfiguration()}
                {renderFunctionGenerator()}
                {renderExtractData()}
            </Form>
        </CustomFormModal>
    );
};

export default ScrapeSetting;
