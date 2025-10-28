'use client';

import { CustomDatePicker, CustomFormModal } from '@/components/custom';
import { MimeType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { NBaseApi, NDataProvider, Option } from '@/interfaces';
import { Icon } from '@iconify/react';
import {
    Button,
    Card,
    Col,
    Flex,
    Form,
    Row,
    Select,
    Space,
    StepProps,
    Steps,
    Switch,
    Table,
} from 'antd';
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
    const [pageSize, setPageSize] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);

    const [mimeTypes, setMimeTypes] = useState<MimeType[]>([]);
    const [dateRanges, setDateRanges] = useState<[string, string]>();
    const [dataProviderIds, setDataProviderIds] = useState<string[]>([]);
    const [checkDuplicateData, setCheckDuplicateData] = useState<boolean>(true);

    const [error, setError] = useState(0);
    const [process, setProcess] = useState(0);
    const [success, setSuccess] = useState(0);
    const [previewData, setPreviewData] = useState<
        NDataProvider.IScrapeDataResponse['successData']
    >([]);

    const { handleCustomMutationData } = useCustomMutationData();

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

    const columns: ColumnType<NDataProvider.IScrapeDataResponse['successData']>[] = [
        {
            title: 'Nhà cung cấp',
            dataIndex: 'dataProviderName',
            key: 'dataProviderName',
            ellipsis: true,
            width: '20%',
        },
        {
            title: 'URL đối tượng',
            dataIndex: 'dataProviderItemUrl',
            key: 'dataProviderItemUrl',
            ellipsis: true,
            width: '30%',
        },
        {
            title: 'Đường dẫn',
            dataIndex: 'url',
            key: 'url',
            width: '15%',
            ellipsis: true,
            render: (url?: string) => url ?? '---',
        },
        {
            title: 'Loại',
            dataIndex: 'mimeType',
            key: 'mimeType',
            width: '15%',
            render: (mimeType?: string) => mimeType ?? '---',
        },
        {
            title: 'Ngày sửa đổi',
            dataIndex: 'lastModified',
            key: 'lastModified',
            width: '20%',
            render: (lastModified?: Date) =>
                lastModified ? dayjs(lastModified).format('DD/MM/YYYY') : '---',
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

        const dataProviderIds = options?.map((item) => item.value as string);
        setDataProviderIds(dataProviderIds ?? []);

        return [...defaultOptions, ...options];
    }, [dataProviders]);

    const handleProcessScrapeData = async () => {
        setIsLoading(true);

        try {
            handleCustomMutationData({
                url: 'data-history/process-scrape-data',
                values: {
                    mimeTypes,
                    dataProviderIds,
                    checkDuplicateData,
                    lastSuccessfulScrapeAt: dateRanges?.[1],
                },
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
                    setPreviewData(response?.data?.successData || []);

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
                {currentStep === StepEnum.Settings && (
                    <Button type="primary" htmlType="submit" onClick={handleProcessScrapeData}>
                        Xử lý
                    </Button>
                )}

                <Button onClick={onClose}>Đóng</Button>
            </Flex>
        );
    };

    const renderSettingStep = () => {
        if (!dataProviderOptions?.length) return <></>;

        return (
            <Form layout="vertical">
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Form.Item
                            name="checkDuplicateData"
                            label="Kiểm tra dữ liệu trùng lặp"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn kiểm tra dữ liệu trùng lặp',
                                },
                            ]}
                        >
                            <Switch
                                defaultChecked={checkDuplicateData}
                                onChange={(value) => setCheckDuplicateData(value)}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="mimeTypes" label="Loại tệp">
                            <Select
                                mode="multiple"
                                placeholder="Loại tệp"
                                onChange={(value) => setMimeTypes(value as MimeType[])}
                                options={Object.values(MimeType).map((type) => ({
                                    value: type,
                                    label: type?.toUpperCase(),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            label="Nhà cung cấp"
                            name="dataProviderIds"
                            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                        >
                            <Select
                                disabled
                                mode="multiple"
                                value={dataProviderIds}
                                options={dataProviderOptions}
                                placeholder="Chọn nhà cung cấp"
                                defaultValue={dataProviders?.length ? dataProviderIds : ''}
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
                    <div className="grid gap-6 grid-cols-4">
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số nhà cung cấp xử lý
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{process ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số nhà cung cấp thành công
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{success ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số nhà cung cấp lỗi
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{error ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Tổng số dữ liệu tìm thấy
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">
                                {previewData?.length ?? 0}
                            </div>
                        </Card>
                    </div>
                </Card>
                <Table
                    bordered
                    size="small"
                    key="preview-data-table"
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
