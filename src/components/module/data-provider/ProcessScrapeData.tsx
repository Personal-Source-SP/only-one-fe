'use client';

import { CustomDatePicker, CustomFormModal, CustomSelect } from '@/components/custom';
import { NBaseApi, NDataProvider, Option } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import { Button, Card, Col, Flex, Form, Row, Space, StepProps, Steps, Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, memo, useMemo, useState } from 'react';

type ProcessScrapeDataProps = {
    open: boolean;
    dataProviders: NDataProvider.IDataProvider[];
    onClose: () => void;
};

const StepEnum = {
    Settings: 0,
    Result: 1,
};

const ProcessScrapeData: FC<ProcessScrapeDataProps> = ({ open, dataProviders, onClose }) => {
    const apiUrl = useApiUrl();
    const [form] = Form.useForm();

    const [pageSize, setPageSize] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);
    const [dateRanges, setDateRanges] = useState<[string, string]>([
        dayjs().startOf('d').toISOString(),
        dayjs().endOf('d').toISOString(),
    ]);

    const [error, setError] = useState(0);
    const [process, setProcess] = useState(0);
    const [success, setSuccess] = useState(0);
    const [previewData, setPreviewData] = useState<NDataProvider.IScrapeDataResponse['dataItems']>(
        [],
    );

    const { mutate } = useCustomMutation<NBaseApi.IResponse<NDataProvider.IScrapeDataResponse>>();

    const steps: StepProps[] = [
        {
            title: 'Cài đặt',
            icon: <Icon icon="lucide:settings" />,
            status: currentStep === StepEnum.Settings ? 'process' : 'finish',
        },
        {
            title: 'Kết quả',
            icon: <Icon icon="lucide:eye" />,
            status: currentStep === StepEnum.Result ? 'process' : 'finish',
        },
    ];

    const columns: ColumnType<NDataProvider.IScrapeDataResponse['dataItems']>[] = [
        {
            title: 'Nhà cung cấp',
            dataIndex: 'dataProviderName',
            key: 'dataProviderName',
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'Đường dẫn',
            dataIndex: 'itemUrl',
            key: 'itemUrl',
            ellipsis: true,
            width: '10%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'errorMessage',
            key: 'errorMessage',
            width: '10%',
            align: 'center',
            render: (errorMessage?: string) =>
                errorMessage ? (
                    <Icon icon="lucide:x" className="w-full" />
                ) : (
                    <Icon icon="lucide:check" className="w-full" />
                ),
        },
        {
            title: 'Dữ liệu',
            dataIndex: 'data',
            key: 'data',
            width: '10%',
            align: 'center',
        },
    ];

    const dataProviderOptions = useMemo(() => {
        const defaultOptions: Option[] = [
            {
                value: '',
                label: 'Tất cả',
            },
        ];

        if (!dataProviders?.length) return defaultOptions;

        const options = dataProviders.map((item) => ({
            value: item.id,
            label: item.baseUrl,
        }));

        return [...defaultOptions, ...options];
    }, [dataProviders]);

    const handleProcessScrapeData = async () => {
        setIsLoading(true);

        try {
            const values = await form?.validateFields();

            mutate({
                values,
                method: 'post',
                url: `${apiUrl}/data-history/process-scrape-data`,
                successNotification(data) {
                    const response =
                        data?.data as NBaseApi.IResponse<NDataProvider.IScrapeDataResponse>;

                    if (!response?.data) {
                        return {
                            type: 'error',
                            message: 'Cào dữ liệu thất bại',
                            description: response?.errorMessage ?? 'Cào dữ liệu thất bại',
                        };
                    }

                    handleChangeStep(StepEnum.Result);

                    setError(response?.data?.error || 0);
                    setProcess(response?.data?.process || 0);
                    setSuccess(response?.data?.success || 0);
                    setPreviewData(response?.data?.dataItems || []);

                    return {
                        type: 'success',
                        message: 'Cào dữ liệu thành công',
                    };
                },
                errorNotification: (error) => {
                    return {
                        type: 'error',
                        message: 'Cào dữ liệu thất bại',
                        description: error?.message ?? 'Cào dữ liệu thất bại',
                    };
                },
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderFooter = () => {
        return (
            <Flex justify="end" align="center" gap={16}>
                <Button type="primary" htmlType="submit" onClick={handleProcessScrapeData}>
                    Lưu
                </Button>

                <Button onClick={onClose}>Hủy</Button>
            </Flex>
        );
    };

    const renderSettingStep = () => {
        if (!dataProviderOptions?.length) return <></>;

        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    dataProviderIds: dataProviders?.length ? dataProviderOptions : '',
                }}
            >
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item
                            label="Nhà cung cấp"
                            name="dataProviderIds"
                            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                        >
                            <CustomSelect
                                mode="multiple"
                                options={dataProviderOptions}
                                placeholder="Chọn nhà cung cấp"
                                disabled={!dataProviders?.length}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <CustomDatePicker
                            showTime
                            name="lastSuccessfulScrapeAt"
                            label="Đến ngày cào dữ liệu"
                            dateRange={dateRanges}
                            setDateRange={(dateRange) => setDateRanges(dateRange)}
                        />
                    </Col>
                </Row>
            </Form>
        );
    };

    const renderResultStep = () => {
        return (
            <Space direction="vertical" className="w-full h-full">
                <Card className="shadow-sm" variant="borderless">
                    <div className="grid gap-6 grid-cols-3">
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Tổng số dữ liệu đang xử lý
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{process ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Tổng số dữ liệu thành công
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{success ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Tổng số dữ liệu lỗi
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{error ?? 0}</div>
                        </Card>
                    </div>
                </Card>
                <Table
                    bordered
                    size="small"
                    columns={columns as any}
                    rowKey="dataProviderId-dataProviderItemId"
                    dataSource={previewData || []}
                    pagination={{
                        pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100', '200', '500'],
                        onChange: (_, pageSize) => {
                            setPageSize(pageSize);
                        },
                    }}
                />
            </Space>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case StepEnum.Settings: {
                return renderSettingStep();
            }

            case StepEnum.Result: {
                return renderResultStep();
            }
        }
    };

    return (
        <CustomFormModal
            formLoading={false}
            modalProps={{
                open,
                width: 900,
                centered: true,
                loading: isLoading,
                title: 'Cào dữ liệu',
                footer: renderFooter(),
            }}
        >
            <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                <Card className="mb-4 bg-green-50 border-green-200" size="small">
                    <Steps
                        items={steps}
                        size="default"
                        current={currentStep}
                        onChange={handleChangeStep}
                    />
                </Card>

                <Space size="middle" direction="vertical" className="w-full h-full">
                    {renderContent()}
                </Space>
            </Space>
        </CustomFormModal>
    );
};

export default memo(ProcessScrapeData);
