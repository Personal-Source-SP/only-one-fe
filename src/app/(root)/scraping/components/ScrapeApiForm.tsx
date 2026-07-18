'use client';

import {
    CustomButton,
    CustomCol,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomRow,
    FormInstance,
} from '@/components/custom';
import { CodeDisplay } from '@/components/common';
import { LinkOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Fragment, JSX } from 'react';
import { FORM_FIELDS } from './ScrapeSetting';

type ScrapeApiFormProps = {
    url: string;
    formUrls: string[];
    form: FormInstance<any>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
};

export const ScrapeApiForm = ({
    url,
    form,
    cookies,
    headers,
    formUrls,
    renderFormUrl,
}: ScrapeApiFormProps) => {
    return (
        <Fragment>
            <CustomRow gutter={[16, 16]}>
                <CustomCol span={12}>
                    <CustomForm.Item
                        label="Thời gian delay giữa mỗi lần retry (ms)"
                        tooltip="Thời gian delay giữa mỗi lần retry (ms)"
                        name={['targetConfig', FORM_FIELDS.RETRY_DELAY]}
                    >
                        <CustomInputNumber
                            min={0}
                            placeholder="Thời gian delay giữa mỗi lần retry (ms)"
                        />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol span={12}>
                    <CustomForm.Item
                        label="Số lần thử lại khi có lỗi"
                        tooltip="Số lần thử lại khi có lỗi"
                        name={['targetConfig', FORM_FIELDS.RETRY_ATTEMPTS]}
                    >
                        <CustomInputNumber min={0} placeholder="Số lần thử lại khi có lỗi" />
                    </CustomForm.Item>
                </CustomCol>

                <CustomCol span={24}>
                    <CustomForm.Item
                        label="Số lượng kết quả tối đa"
                        tooltip="Số lượng kết quả tối đa"
                        name={['targetConfig', FORM_FIELDS.MAX_RESULTS]}
                    >
                        <CustomInputNumber min={0} placeholder="Số lượng kết quả tối đa" />
                    </CustomForm.Item>
                </CustomCol>
            </CustomRow>

            <CustomForm.Item
                label="Tham số truy vấn"
                name={['targetConfig', FORM_FIELDS.QUERY_PARAMS]}
            >
                <CustomInput placeholder="Tham số truy vấn" />
            </CustomForm.Item>

            <CustomForm.Item
                label="Tham số truy vấn đầu tiên"
                name={['targetConfig', FORM_FIELDS.FIRST_QUERY_PARAM]}
            >
                <CustomInput placeholder="Tham số truy vấn đầu tiên (sử dụng lần đầu tiên cào)" />
            </CustomForm.Item>

            <CustomForm.Item label="User-Agent" name={['targetConfig', FORM_FIELDS.USER_AGENT]}>
                <CustomInput placeholder="User-Agent" />
            </CustomForm.Item>

            <CustomFlex justify="space-between" align="end" gap={10}>
                <CustomForm.Item
                    label="URL"
                    name={FORM_FIELDS.URL}
                    className="w-full max-w-[calc(100%-50px)]"
                >
                    {renderFormUrl(FORM_FIELDS.URL)}
                </CustomForm.Item>
                <CustomButton
                    type="primary"
                    className="mb-2"
                    disabled={!url}
                    icon={<LinkOutlined />}
                    onClick={() => window.open(url, '_blank')}
                />
            </CustomFlex>

            <CustomForm.List name={FORM_FIELDS.ADDITIONAL_URLS}>
                {(fields, { add, remove }) => (
                    <Fragment>
                        {fields.map(({ key, name }, index) => (
                            <CustomFlex
                                key={key}
                                justify="space-between"
                                align="center"
                                gap={10}
                                className="mt-2"
                            >
                                <CustomForm.Item
                                    key={key}
                                    name={name}
                                    className="w-full max-w-[calc(100%-50px)]"
                                >
                                    {renderFormUrl(FORM_FIELDS.ADDITIONAL_URLS, index)}
                                </CustomForm.Item>
                                <MinusCircleOutlined
                                    className="mb-2"
                                    onClick={() => remove(name)}
                                />
                                <CustomButton
                                    type="primary"
                                    className="mb-2"
                                    icon={<LinkOutlined />}
                                    disabled={!formUrls?.[index]}
                                    onClick={() => window.open(formUrls?.[index], '_blank')}
                                />
                            </CustomFlex>
                        ))}

                        <CustomButton
                            type="dashed"
                            disabled={false}
                            onClick={() => add()}
                            className="my-2 w-full"
                            icon={<PlusOutlined />}
                        >
                            Thêm URL bổ sung
                        </CustomButton>
                    </Fragment>
                )}
            </CustomForm.List>

            <CustomForm.Item name={['targetConfig', FORM_FIELDS.HEADERS]}>
                <p className="text-sm font-medium !mb-3">Cấu hình headers:</p>
                <CodeDisplay
                    title="Headers"
                    isDisplayLanguage
                    language="json"
                    code={JSON.stringify(headers || {})}
                    onCodeChange={(newCode: string) => {
                        form?.setFieldValue(['targetConfig', FORM_FIELDS.HEADERS], newCode);
                    }}
                />
            </CustomForm.Item>

            <CustomForm.Item name={['targetConfig', FORM_FIELDS.COOKIES]}>
                <p className="text-sm font-medium !mb-3">Cấu hình cookies:</p>
                <CodeDisplay
                    title="Cookies"
                    isDisplayLanguage
                    language="json"
                    code={JSON.stringify(cookies || {})}
                    onCodeChange={(newCode: string) => {
                        form?.setFieldValue(['targetConfig', FORM_FIELDS.COOKIES], newCode);
                    }}
                />
            </CustomForm.Item>
        </Fragment>
    );
};
