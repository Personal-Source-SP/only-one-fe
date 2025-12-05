'use client';

import { CustomFormModal } from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { DataImportType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { NBaseApi, NImportData } from '@/interfaces';
import { FileExcelOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
import {
    Button,
    Card,
    Flex,
    Result,
    Space,
    Spin,
    StepsProps,
    Steps,
    Table,
    Typography,
    Upload,
    UploadFile,
} from 'antd';
import { ColumnType } from 'antd/es/table';
import { useState } from 'react';

type ImportDataProps = {
    open: boolean;
    dataType: DataImportType;
    columns: ColumnType<Record<string, any>>[];
    onClose: () => void;
    onSuccess?: () => void;
};

const StepEnum = {
    Upload: 0,
    Preview: 1,
    Result: 2,
};

const ImportData = ({ open, dataType, columns, onClose, onSuccess }: ImportDataProps) => {
    const { handleMessage } = useMainContext();

    const [pageSize, setPageSize] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [currentStep, setCurrentStep] = useState(StepEnum.Upload);

    const [previewItemData, setPreviewItemData] =
        useState<NImportData.IPreviewImportDataResponse>();
    const [importItemData, setImportItemData] = useState<NImportData.IImportDataResponse>();

    const { handleCustomMutationData } = useCustomMutationData();

    const steps: StepsProps['items'] = [
        {
            title: 'Tải lên',
            icon: <Icon icon="lucide:settings" />,
            status: currentStep === StepEnum.Upload ? 'process' : 'finish',
        },
        {
            title: 'Xem trước',
            icon: <Icon icon="lucide:eye" />,
            status: currentStep === StepEnum.Preview ? 'process' : 'finish',
        },
        {
            title: 'Hoàn tất',
            icon: <Icon icon="lucide:check" />,
            status: currentStep === StepEnum.Result ? 'process' : 'finish',
        },
    ];

    const handleImportFile = async () => {
        if (!fileList?.length) {
            return handleMessage({
                type: 'error',
                content: 'Vui lòng chọn tệp',
            });
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj as File);

        try {
            handleCustomMutationData({
                url: `import-data/preview-import-data/${dataType}`,
                values: formData,
                successNotification(data) {
                    const response =
                        data?.data as NBaseApi.IResponse<NImportData.IPreviewImportDataResponse>;

                    if (!response?.data) {
                        return {
                            type: 'error',
                            message: 'Tải lên file thất bại',
                            description: response?.errorMessage ?? 'Tải lên file thất bại',
                        };
                    }

                    handleChangeStep(StepEnum.Preview);
                    setPreviewItemData(response?.data);

                    return {
                        type: 'success',
                        message: 'Tải lên file thành công',
                    };
                },
                errorNotification: (error) => {
                    return {
                        type: 'error',
                        message: 'Tải lên file thất bại',
                        description: error?.message ?? 'Tải lên file thất bại',
                    };
                },
            });
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportItem = async () => {
        setIsLoading(true);

        try {
            handleCustomMutationData({
                url: 'import-data/import-data',
                values: {
                    dataType,
                    data: previewItemData?.data ?? [],
                },
                successNotification(data) {
                    const response =
                        data?.data as NBaseApi.IResponse<NImportData.IImportDataResponse>;

                    if (!response?.data) {
                        return {
                            type: 'error',
                            message: 'Nhập dữ liệu thất bại',
                            description: response?.errorMessage ?? 'Nhập dữ liệu thất bại',
                        };
                    }

                    handleChangeStep(StepEnum.Result);
                    setImportItemData(response?.data);

                    return {
                        type: 'success',
                        message: 'Nhập dữ liệu thành công',
                    };
                },
                errorNotification: (error) => {
                    return {
                        type: 'error',
                        message: 'Nhập dữ liệu thất bại',
                        description: error?.message ?? 'Nhập dữ liệu thất bại',
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

    const handleFileChange = ({ fileList }: { fileList: UploadFile[] }) => {
        const filteredFiles = fileList.filter((file) => {
            const ext = (file.name || '').toLowerCase();
            const allowed = ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv');
            if (!allowed && file.status !== 'removed') {
                handleMessage({
                    type: 'error',
                    content: 'Only Excel (.xlsx, .xls) or CSV files are allowed',
                });

                return false;
            }
            return true;
        });
        if (filteredFiles.length > 1) {
            setFileList([filteredFiles[filteredFiles.length - 1]]);
        } else {
            setFileList(filteredFiles);
        }
    };

    const renderFooter = () => {
        return (
            <Flex justify="end" align="center" gap={16}>
                {currentStep === StepEnum.Upload && (
                    <Button type="primary" onClick={handleImportFile}>
                        Nhập dữ liệu
                    </Button>
                )}

                {currentStep === StepEnum.Preview && (
                    <>
                        <Button type="primary" onClick={() => handleChangeStep(StepEnum.Upload)}>
                            Quay lại
                        </Button>
                        <Button type="primary" onClick={handleImportItem}>
                            Nhập dữ liệu
                        </Button>
                    </>
                )}

                <Button
                    onClick={() => {
                        onClose();
                        if (currentStep === StepEnum.Result) {
                            onSuccess?.();
                        }
                    }}
                >
                    Đóng
                </Button>
            </Flex>
        );
    };

    const renderUploadStep = () => {
        return (
            <Card variant="borderless" className="shadow-sm">
                <Upload.Dragger
                    maxCount={1}
                    fileList={fileList}
                    accept=".xlsx,.xls,.csv"
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                >
                    <div className="p-6">
                        <p className="ant-upload-drag-icon">
                            <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                        </p>
                        <p className="ant-upload-text font-medium text-lg mt-4">
                            Drag and drop or click to upload
                        </p>
                        <p className="ant-upload-hint text-gray-500">
                            Supported formats: .xlsx, .xls, .csv
                        </p>
                    </div>
                </Upload.Dragger>
            </Card>
        );
    };

    const renderPreviewStep = () => {
        if (!previewItemData) return <></>;

        const { updates, overridden, errors } = previewItemData?.statistics ?? {};

        return (
            <Space direction="vertical" className="w-full h-full">
                <Card className="shadow-sm" variant="borderless">
                    <div className="grid gap-6 grid-cols-3">
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng được cập nhật
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{updates ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng được ghi đè
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">
                                {overridden ?? 0}
                            </div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng có lỗi
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{errors ?? 0}</div>
                        </Card>
                    </div>
                </Card>
                <Table
                    bordered
                    size="small"
                    rowKey="itemId"
                    columns={columns}
                    key="preview-item-table"
                    dataSource={previewItemData?.data ?? []}
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

    const renderResultStep = () => {
        if (!importItemData) return <></>;

        return (
            <Space direction="vertical" className="w-full h-full">
                <Result
                    status={importItemData?.success ? 'success' : 'warning'}
                    subTitle={`Cập nhật ${importItemData?.updated ?? 0} đối tượng`}
                    title={
                        importItemData?.success
                            ? 'Nhập dữ liệu thành công'
                            : 'Nhập dữ liệu thất bại'
                    }
                />
                {!!importItemData?.validationErrorMessages?.length && (
                    <Table
                        bordered
                        size="small"
                        pagination={{ pageSize: 20, showSizeChanger: true }}
                        dataSource={importItemData.validationErrorMessages.map(
                            (message, index) => ({
                                key: index,
                                message,
                            }),
                        )}
                        columns={[
                            {
                                key: 'message',
                                dataIndex: 'message',
                                title: 'Lỗi nhập dữ liệu',
                                render: (text: string) => (
                                    <Typography.Text type="danger">{text}</Typography.Text>
                                ),
                            },
                        ]}
                    />
                )}
            </Space>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case StepEnum.Upload: {
                return renderUploadStep();
            }

            case StepEnum.Preview: {
                return renderPreviewStep();
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
                title: 'Nhập dữ liệu',
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

                <Spin spinning={isLoading}>
                    <Space size="middle" direction="vertical" className="w-full h-full">
                        {renderContent()}
                    </Space>
                </Spin>
            </Space>
        </CustomFormModal>
    );
};

export default ImportData;
