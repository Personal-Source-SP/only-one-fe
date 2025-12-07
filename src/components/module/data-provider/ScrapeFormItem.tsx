'use client';

import { LinkOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, FormInstance, Input, InputNumber, Row } from 'antd';
import { Fragment, JSX } from 'react';
import { FORM_FIELDS } from './ScrapeSetting';
import { ScraperServiceEnum } from '../../../enums';
import { Option } from '../../../interfaces';
import { CustomSwitch } from '../../custom';
import CodeDisplay from '../code-display';

const FormGeneric = ({
    url,
    formUrls,
    form,
    headers,
    cookies,
    renderFormUrl,
}: {
    url: string;
    formUrls: string[];
    form: FormInstance<any>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
}) => {
    return (
        <Fragment>
            <Row gutter={[16, 16]}>
                <CustomSwitch
                    span={12}
                    fieldLabel="Lấy phần tử cha"
                    fieldPlaceholder="Lấy phần tử cha làm container cho selector chính"
                    formFields={['targetConfig', FORM_FIELDS.IS_GET_PARENT_ELEMENT]}
                />

                <CustomSwitch
                    span={12}
                    fieldLabel="Bật chế độ ẩn danh"
                    fieldPlaceholder="Bật chế độ ẩn danh để tránh bị phát hiện là bot"
                    formFields={['targetConfig', FORM_FIELDS.STEALTH_MODE]}
                />

                <CustomSwitch
                    span={12}
                    fieldLabel="Bật chế độ vượt qua Cloudflare"
                    fieldPlaceholder="Bật chế độ vượt qua Cloudflare để tránh bị phát hiện là bot"
                    formFields={['targetConfig', FORM_FIELDS.CLOUDFLARE_BYPASS]}
                />

                <CustomSwitch
                    span={12}
                    fieldLabel="Bật JavaScript"
                    fieldPlaceholder="Bật JavaScript để tránh bị phát hiện là bot"
                    formFields={['targetConfig', FORM_FIELDS.JAVASCRIPT_ENABLED]}
                />

                <CustomSwitch
                    span={12}
                    fieldLabel="Bật ảnh"
                    fieldPlaceholder="Bật ảnh để tránh bị phát hiện là bot"
                    formFields={['targetConfig', FORM_FIELDS.IMAGES_ENABLED]}
                />

                <CustomSwitch
                    span={12}
                    fieldLabel="Bật CSS"
                    fieldPlaceholder="Bật CSS để tránh bị phát hiện là bot"
                    formFields={['targetConfig', FORM_FIELDS.CSS_ENABLED]}
                />

                <Col span={12}>
                    <Form.Item
                        label="Thời gian delay giữa mỗi lần retry (ms)"
                        tooltip="Thời gian delay giữa mỗi lần retry (ms)"
                        name={['targetConfig', FORM_FIELDS.RETRY_DELAY]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Thời gian delay giữa mỗi lần retry (ms)"
                        />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label="Số lần thử lại khi có lỗi"
                        tooltip="Số lần thử lại khi có lỗi"
                        name={['targetConfig', FORM_FIELDS.RETRY_ATTEMPTS]}
                    >
                        <InputNumber min={0} placeholder="Số lần thử lại khi có lỗi" />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label="Số lượng kết quả tối đa"
                        tooltip="Số lượng kết quả tối đa"
                        name={['targetConfig', FORM_FIELDS.MAX_RESULTS]}
                    >
                        <InputNumber min={0} placeholder="Số lượng kết quả tối đa" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                label="Selector chính"
                name={['targetConfig', FORM_FIELDS.MAIN_CONTENT_SELECTOR]}
                rules={[
                    {
                        required: true,
                        message: 'Selector chính không được để trống',
                    },
                ]}
            >
                <Input placeholder="Selector chính" />
            </Form.Item>

            <Form.Item label="Selector chờ" name={['targetConfig', FORM_FIELDS.WAIT_FOR_SELECTOR]}>
                <Input placeholder="Selector chờ" />
            </Form.Item>

            <Form.Item label="User-Agent" name={['targetConfig', FORM_FIELDS.USER_AGENT]}>
                <Input placeholder="User-Agent" />
            </Form.Item>

            <Flex justify="space-between" align="end" gap={10}>
                <Form.Item
                    label="URL"
                    name={FORM_FIELDS.URL}
                    className="w-full max-w-[calc(100%-50px)]"
                >
                    {renderFormUrl(FORM_FIELDS.URL)}
                </Form.Item>
                <Button
                    type="primary"
                    className="mb-2"
                    disabled={!url}
                    icon={<LinkOutlined />}
                    onClick={() => window.open(url, '_blank')}
                />
            </Flex>

            <Form.List name={FORM_FIELDS.ADDITIONAL_URLS}>
                {(fields, { add, remove }) => (
                    <Fragment>
                        {fields.map(({ key, name }, index) => (
                            <Flex
                                key={key}
                                justify="space-between"
                                align="center"
                                gap={10}
                                className="mt-2"
                            >
                                <Form.Item
                                    key={key}
                                    name={name}
                                    className="w-full max-w-[calc(100%-50px)]"
                                >
                                    {renderFormUrl(FORM_FIELDS.ADDITIONAL_URLS, index)}
                                </Form.Item>
                                <MinusCircleOutlined
                                    className="mb-2"
                                    onClick={() => remove(name)}
                                />
                                <Button
                                    type="primary"
                                    className="mb-2"
                                    icon={<LinkOutlined />}
                                    disabled={!formUrls?.[index]}
                                    onClick={() => window.open(formUrls?.[index], '_blank')}
                                />
                            </Flex>
                        ))}

                        <Button
                            type="dashed"
                            disabled={false}
                            onClick={() => add()}
                            className="my-2 w-full"
                            icon={<PlusOutlined />}
                        >
                            Thêm URL bổ sung
                        </Button>
                    </Fragment>
                )}
            </Form.List>

            <Form.Item name={['targetConfig', FORM_FIELDS.HEADERS]}>
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
            </Form.Item>

            <Form.Item name={['targetConfig', FORM_FIELDS.COOKIES]}>
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
            </Form.Item>
        </Fragment>
    );
};

const FormAPI = ({
    url,
    formUrls,
    form,
    headers,
    cookies,
    renderFormUrl,
}: {
    url: string;
    formUrls: string[];
    form: FormInstance<any>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
}) => {
    return (
        <Fragment>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Form.Item
                        label="Thời gian delay giữa mỗi lần retry (ms)"
                        tooltip="Thời gian delay giữa mỗi lần retry (ms)"
                        name={['targetConfig', FORM_FIELDS.RETRY_DELAY]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Thời gian delay giữa mỗi lần retry (ms)"
                        />
                    </Form.Item>
                </Col>

                <Col span={12}>
                    <Form.Item
                        label="Số lần thử lại khi có lỗi"
                        tooltip="Số lần thử lại khi có lỗi"
                        name={['targetConfig', FORM_FIELDS.RETRY_ATTEMPTS]}
                    >
                        <InputNumber min={0} placeholder="Số lần thử lại khi có lỗi" />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label="Số lượng kết quả tối đa"
                        tooltip="Số lượng kết quả tối đa"
                        name={['targetConfig', FORM_FIELDS.MAX_RESULTS]}
                    >
                        <InputNumber min={0} placeholder="Số lượng kết quả tối đa" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Tham số truy vấn" name={['targetConfig', FORM_FIELDS.QUERY_PARAMS]}>
                <Input placeholder="Tham số truy vấn" />
            </Form.Item>
            <Form.Item
                label="Tham số truy vấn đầu tiên"
                name={['targetConfig', FORM_FIELDS.FIRST_QUERY_PARAM]}
            >
                <Input placeholder="Tham số truy vấn đầu tiên (sử dụng lần đầu tiên cào)" />
            </Form.Item>

            <Form.Item label="User-Agent" name={['targetConfig', FORM_FIELDS.USER_AGENT]}>
                <Input placeholder="User-Agent" />
            </Form.Item>

            <Flex justify="space-between" align="end" gap={10}>
                <Form.Item
                    label="URL"
                    name={FORM_FIELDS.URL}
                    className="w-full max-w-[calc(100%-50px)]"
                >
                    {renderFormUrl(FORM_FIELDS.URL)}
                </Form.Item>
                <Button
                    type="primary"
                    className="mb-2"
                    disabled={!url}
                    icon={<LinkOutlined />}
                    onClick={() => window.open(url, '_blank')}
                />
            </Flex>

            <Form.List name={FORM_FIELDS.ADDITIONAL_URLS}>
                {(fields, { add, remove }) => (
                    <Fragment>
                        {fields.map(({ key, name }, index) => (
                            <Flex
                                key={key}
                                justify="space-between"
                                align="center"
                                gap={10}
                                className="mt-2"
                            >
                                <Form.Item
                                    key={key}
                                    name={name}
                                    className="w-full max-w-[calc(100%-50px)]"
                                >
                                    {renderFormUrl(FORM_FIELDS.ADDITIONAL_URLS, index)}
                                </Form.Item>
                                <MinusCircleOutlined
                                    className="mb-2"
                                    onClick={() => remove(name)}
                                />
                                <Button
                                    type="primary"
                                    className="mb-2"
                                    icon={<LinkOutlined />}
                                    disabled={!formUrls?.[index]}
                                    onClick={() => window.open(formUrls?.[index], '_blank')}
                                />
                            </Flex>
                        ))}

                        <Button
                            type="dashed"
                            disabled={false}
                            onClick={() => add()}
                            className="my-2 w-full"
                            icon={<PlusOutlined />}
                        >
                            Thêm URL bổ sung
                        </Button>
                    </Fragment>
                )}
            </Form.List>

            <Form.Item name={['targetConfig', FORM_FIELDS.HEADERS]}>
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
            </Form.Item>

            <Form.Item name={['targetConfig', FORM_FIELDS.COOKIES]}>
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
            </Form.Item>
        </Fragment>
    );
};

const FormLocal = ({
    url,
    renderFormUrl,
}: {
    url: string;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
}) => {
    return (
        <Row gutter={[16, 16]}>
            <Col span={12}>
                <Form.Item
                    label="Thời gian delay giữa mỗi lần retry (ms)"
                    tooltip="Thời gian delay giữa mỗi lần retry (ms)"
                    name={['targetConfig', FORM_FIELDS.RETRY_DELAY]}
                >
                    <InputNumber min={0} placeholder="Thời gian delay giữa mỗi lần retry (ms)" />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item
                    label="Số lần thử lại khi có lỗi"
                    tooltip="Số lần thử lại khi có lỗi"
                    name={['targetConfig', FORM_FIELDS.RETRY_ATTEMPTS]}
                >
                    <InputNumber min={0} placeholder="Số lần thử lại khi có lỗi" />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item
                    label="Số lượng kết quả tối đa"
                    tooltip="Số lượng kết quả tối đa"
                    name={['targetConfig', FORM_FIELDS.MAX_RESULTS]}
                >
                    <InputNumber min={0} placeholder="Số lượng kết quả tối đa" />
                </Form.Item>
            </Col>
            <Col span={24}>
                <Flex justify="space-between" align="end" gap={10}>
                    <Form.Item
                        label="URL"
                        name={FORM_FIELDS.URL}
                        className="w-full max-w-[calc(100%-50px)]"
                    >
                        {renderFormUrl(FORM_FIELDS.URL)}
                    </Form.Item>
                    <Button
                        type="primary"
                        className="mb-2"
                        disabled={!url}
                        icon={<LinkOutlined />}
                        onClick={() => window.open(url, '_blank')}
                    />
                </Flex>
            </Col>
        </Row>
    );
};

const ScrapeFormItem = ({
    url,
    formUrls,
    form,
    headers,
    cookies,
    scraperService,
    renderFormUrl,
}: {
    url: string;
    formUrls: string[];
    form: FormInstance<any>;
    headers: Record<string, string>;
    cookies: Record<string, string>;
    scraperService: ScraperServiceEnum;
    renderFormUrl: (field: string, index?: number) => JSX.Element;
}) => {
    switch (scraperService) {
        case ScraperServiceEnum.GENERIC: {
            return (
                <FormGeneric
                    url={url}
                    form={form}
                    cookies={cookies}
                    headers={headers}
                    formUrls={formUrls}
                    renderFormUrl={renderFormUrl}
                />
            );
        }

        case ScraperServiceEnum.API: {
            return (
                <FormAPI
                    url={url}
                    form={form}
                    headers={headers}
                    cookies={cookies}
                    formUrls={formUrls}
                    renderFormUrl={renderFormUrl}
                />
            );
        }

        case ScraperServiceEnum.LOCAL: {
            return <FormLocal url={url} renderFormUrl={renderFormUrl} />;
        }
    }
};

export default ScrapeFormItem;
