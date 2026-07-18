'use client';

import { FormModalLayout, StatusTag, CodeDisplay } from '@/components/common';
import {
    CustomButton,
    CustomCard,
    CustomCol,
    CustomDivider,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomRow,
    CustomSelect,
    CustomSpace,
    CustomToggle,
    CustomTypography,
} from '@/components/custom';

import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_HTML_CONTENT_STRING,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
} from '@/constants';
import { useMainContext } from '@/contexts/MainContext';
import { DataProviderStatus, MessageType, NotificationType, ScraperServiceEnum } from '@/enums';
import { useCustomModal, useCustomMutationData, useSelectDataProviderItem } from '@/hooks';
import { NBaseApi, NDataProvider } from '@/interfaces';

import { isEmpty, isNumber } from 'lodash';
import { Fragment, useMemo, useState } from 'react';
import { ScrapeFormItem } from './ScrapeFormItem';

type DataProviderForm = NDataProvider.IDataProvider & {
    url: string;
    extractData: Record<string, unknown>;
    additionalUrls?: string[];
    expectedCurrency?: string;
    screenShotImage?: string;
};

type ScrapeSettingProps = {
    modalPropsData: ReturnType<typeof useCustomModal>;
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

export const ScrapeSetting = ({ modalPropsData, onClose }: ScrapeSettingProps) => {
    const { handleNotification } = useMainContext();
    const { formProps, modalProps, formLoading } = modalPropsData;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);

    const form = formProps?.form;
    const dataProvider = formProps?.initialValues as DataProviderForm | undefined;
    const isParentProvider = dataProvider?.parentId ? false : true;

    const url = CustomForm.useWatch([FORM_FIELDS.URL], { form, preserve: true });
    const formUrls = CustomForm.useWatch([FORM_FIELDS.ADDITIONAL_URLS], { form, preserve: true });
    const extractData = CustomForm.useWatch([FORM_FIELDS.EXTRACT_DATA], { form, preserve: true });
    const scraperService = CustomForm.useWatch([FORM_FIELDS.SCRAPER_SERVICE], {
        form,
        preserve: true,
    });
    const processingTime = CustomForm.useWatch([FORM_FIELDS.PROCESSING_TIME], {
        form,
        preserve: true,
    });
    const htmlContentString = CustomForm.useWatch([FORM_FIELDS.HTML_CONTENT_STRING], {
        form,
        preserve: true,
    });
    const additionalExtractData = CustomForm.useWatch([FORM_FIELDS.ADDITIONAL_EXTRACT_DATA], {
        form,
        preserve: true,
    });

    const headers = CustomForm.useWatch(['targetConfig', FORM_FIELDS.HEADERS], {
        form,
        preserve: true,
    });
    const cookies = CustomForm.useWatch(['targetConfig', FORM_FIELDS.COOKIES], {
        form,
        preserve: true,
    });
    const functionGenerator = CustomForm.useWatch(
        ['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR],
        {
            form,
            preserve: true,
        },
    );

    const { handleCustomMutationData: handleUpdate } = useCustomMutationData();
    const { handleCustomMutationData: handleCreate } = useCustomMutationData();
    const { options: dataProviderItemOptions, query: dataProviderItemQuery } =
        useSelectDataProviderItem({
            id: dataProvider?.id,
            type: 'data-provider',
            enabled: !!dataProvider?.id,
        });

    const initialValues = useMemo(() => {
        if (isEmpty(formProps?.initialValues?.targetConfig)) {
            return {
                scraperService: ScraperServiceEnum.API,
                targetConfig: {
                    maxResults: 10,
                    retryDelay: 1000,
                    retryAttempts: 3,
                    mainContentSelector: '',
                    isGetParentElement: false,
                    functionGenerator: DEFAULT_API_FUNCTION_GENERATOR,
                },
            };
        }

        return formProps?.initialValues;
    }, [formProps?.initialValues]);

    const handleTestParser = async () => {
        if (!url && !htmlContentString) {
            handleNotification({
                type: NotificationType.ERROR,
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
                            type: MessageType.ERROR,
                            message: 'Test parser thất bại',
                            description: response?.errorMessage ?? 'Test parser thất bại',
                        };
                    }

                    setIsLoading(false);
                    form?.setFieldValue([FORM_FIELDS.EXTRACT_DATA], response.data);

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Test parser thành công',
                    };
                },
                errorNotification: (error) => {
                    setIsLoading(false);

                    return {
                        type: MessageType.ERROR,
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
                type: NotificationType.ERROR,
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
                        type: MessageType.ERROR,
                        message: 'Cập nhật cấu hình dữ liệu thất bại',
                        description: data?.data?.message ?? 'Cập nhật cấu hình dữ liệu thất bại',
                    };
                }

                onClose?.();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Cập nhật cấu hình dữ liệu thành công',
                };
            },
            errorNotification: () => {
                return {
                    type: MessageType.ERROR,
                    message: 'Cập nhật cấu hình dữ liệu thất bại',
                    description: 'Cập nhật cấu hình dữ liệu thất bại',
                };
            },
        });
    };

    const handleSwitchStatus = (status: DataProviderStatus) => {
        if (!dataProvider?.id) {
            return handleNotification({
                type: NotificationType.ERROR,
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
                        type: MessageType.ERROR,
                        message: 'Chuyển trạng thái thất bại',
                        description: data?.data?.message ?? 'Chuyển trạng thái thất bại',
                    };
                }

                onClose();

                return {
                    type: MessageType.SUCCESS,
                    message: 'Chuyển trạng thái thành công',
                };
            },
            errorNotification: (error) => {
                return {
                    type: MessageType.ERROR,
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

    const handleLocalFolderRegistered = (response: NDataProvider.RegisterLocalFolderResponse) => {
        dataProviderItemQuery?.refetch();
        form?.setFieldValue([FORM_FIELDS.URL], response.itemUrl);
    };

    const renderTitle = () => {
        if (!dataProvider) return <></>;

        return (
            <CustomFlex justify="space-between" align="center">
                <CustomSpace size={0}>
                    <span className="mr-1">Cấu hình dữ liệu</span>
                    <span className="mr-2">{`for ${dataProvider.name || dataProvider.baseUrl}`}</span>
                    <StatusTag status={dataProvider?.status} />
                </CustomSpace>
            </CustomFlex>
        );
    };

    const renderFooter = () => {
        return (
            <CustomFlex justify="end" align="center" gap={16}>
                {(dataProvider?.status !== DataProviderStatus.UNCONFIGURED ||
                    dataProvider?.parent?.status !== DataProviderStatus.UNCONFIGURED) && (
                    <CustomButton
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
                    </CustomButton>
                )}

                <CustomButton
                    type="primary"
                    htmlType="submit"
                    disabled={!isParentProvider}
                    onClick={() => form?.submit()}
                >
                    Lưu
                </CustomButton>

                <CustomButton onClick={handleCancel}>Hủy</CustomButton>
            </CustomFlex>
        );
    };

    const renderFormUrl = (field: string, index?: number) => {
        if (!dataProviderItemOptions?.length) {
            return <CustomInput disabled={false} placeholder="URL" />;
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
                <CustomForm.Item
                    label="Dịch vụ"
                    name={FORM_FIELDS.SCRAPER_SERVICE}
                    rules={[
                        {
                            required: true,
                            message: 'Dịch vụ cần chọn',
                        },
                    ]}
                >
                    <CustomSelect
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
                </CustomForm.Item>

                <ScrapeFormItem
                    url={url}
                    form={form}
                    headers={headers}
                    cookies={cookies}
                    formUrls={formUrls}
                    dataProvider={dataProvider}
                    scraperService={scraperService}
                    onRegistered={handleLocalFolderRegistered}
                    renderFormUrl={renderFormUrl}
                />
            </Fragment>
        );
    };

    const renderFunctionGenerator = () => {
        if (scraperService === ScraperServiceEnum.LOCAL) {
            return (
                <CustomFlex justify="end" align="center" className="my-2">
                    <CustomButton type="primary" onClick={handleTestParser} disabled={false}>
                        Thử nghiệm hàm
                    </CustomButton>
                </CustomFlex>
            );
        }

        const isFunctionGeneratorEmpty = isEmpty(functionGenerator);
        if (isFunctionGeneratorEmpty) return <></>;

        return (
            <Fragment>
                <CustomForm.Item name={['targetConfig', FORM_FIELDS.FUNCTION_GENERATOR]}>
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
                </CustomForm.Item>

                <CustomFlex justify="space-between" align="center" className="my-2">
                    <CustomSpace>
                        <CustomToggle
                            checked={isTestHtmlContent}
                            onChange={() => setIsTestHtmlContent(!isTestHtmlContent)}
                        />
                        <CustomTypography.Text type="secondary">
                            Sử dụng HTML content
                        </CustomTypography.Text>
                    </CustomSpace>
                    <CustomButton type="primary" onClick={handleTestParser} disabled={false}>
                        Thử nghiệm hàm
                    </CustomButton>
                </CustomFlex>

                {isTestHtmlContent && (
                    <CustomForm.Item name={FORM_FIELDS.HTML_CONTENT_STRING}>
                        <CodeDisplay
                            expanded
                            language="html"
                            code={htmlContentString || DEFAULT_HTML_CONTENT_STRING}
                            onCodeChange={(newCode: string) => {
                                form?.setFieldValue([FORM_FIELDS.HTML_CONTENT_STRING], newCode);
                            }}
                        />
                    </CustomForm.Item>
                )}
            </Fragment>
        );
    };

    const renderExtractData = () => {
        if (isEmpty(extractData)) return <></>;

        return (
            <CustomCard className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CustomRow gutter={[24, 24]}>
                    <CustomCol xs={24} md={12}>
                        <CustomSpace direction="vertical" size={8}>
                            <CustomTypography.Text type="secondary">Giá:</CustomTypography.Text>
                            <CustomTypography.Title level={2}>
                                {extractData?.productPrice}
                            </CustomTypography.Title>
                        </CustomSpace>
                    </CustomCol>
                    <CustomCol xs={24} md={12}>
                        <CustomSpace direction="vertical" size={8}>
                            <CustomTypography.Text type="secondary">Tiền tệ:</CustomTypography.Text>
                            <CustomTypography.Title level={2}>
                                {dataProvider?.expectedCurrency}
                            </CustomTypography.Title>
                        </CustomSpace>
                    </CustomCol>
                </CustomRow>

                <CustomDivider />

                <div className="space-y-3">
                    <CustomForm.Item name={FORM_FIELDS.EXTRACT_DATA}>
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
                    </CustomForm.Item>
                </div>
            </CustomCard>
        );
    };

    return (
        <FormModalLayout
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
            <CustomForm
                {...formProps}
                layout="vertical"
                disabled={!isParentProvider}
                initialValues={initialValues}
                className="[&_.ant-form-item]:!mb-2"
                onFinish={(values) => handleUpdateTargetConfig(values as DataProviderForm)}
            >
                {renderFormTargetConfiguration()}
                {renderFunctionGenerator()}
                {renderExtractData()}
            </CustomForm>
        </FormModalLayout>
    );
};
