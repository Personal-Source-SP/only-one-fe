'use client';

import { FormModalLayout } from '@/components/common';
import {
    ColumnType,
    CustomButton,
    CustomCard,
    CustomFlex,
    CustomResult,
    CustomSpace,
    CustomSpin,
    CustomSteps,
    CustomDataTable,
    CustomTypography,
    CustomUpload,
    StepsProps,
    UploadFile,
} from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useMainContext } from '@/contexts/MainContext';
import { DataImportType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import type {
    IImportDataResponse,
    IPreviewImportDataResponse,
} from '@/app/(root)/scraping/scraping-data/types';
import type { NBaseApi } from '@/interfaces';
import { FileExcelOutlined } from '@ant-design/icons';
import { Icon } from '@iconify/react';
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
    CustomResult: 2,
};

export const ImportData = ({ open, dataType, columns, onClose, onSuccess }: ImportDataProps) => {
    const { handleMessage } = useMainContext();

    const [pageSize, setPageSize] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [currentStep, setCurrentStep] = useState(StepEnum.Upload);

    const [previewItemData, setPreviewItemData] = useState<IPreviewImportDataResponse>();
    const [importItemData, setImportItemData] = useState<IImportDataResponse>();

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
            status: currentStep === StepEnum.CustomResult ? 'process' : 'finish',
        },
    ];

    const handleImportFile = async () => {
        if (!fileList?.length) {
            return handleMessage({
                type: MessageType.ERROR,
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
                    const response = data?.data as NBaseApi.IResponse<IPreviewImportDataResponse>;

                    if (!response?.data) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Tải lên file thất bại',
                            description: response?.errorMessage ?? 'Tải lên file thất bại',
                        };
                    }

                    handleChangeStep(StepEnum.Preview);
                    setPreviewItemData(response?.data);

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Tải lên file thành công',
                    };
                },
                errorNotification: (error) => {
                    return {
                        type: MessageType.ERROR,
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
                    const response = data?.data as NBaseApi.IResponse<IImportDataResponse>;

                    if (!response?.data) {
                        return {
                            type: MessageType.ERROR,
                            message: 'Nhập dữ liệu thất bại',
                            description: response?.errorMessage ?? 'Nhập dữ liệu thất bại',
                        };
                    }

                    handleChangeStep(StepEnum.CustomResult);
                    setImportItemData(response?.data);

                    return {
                        type: MessageType.SUCCESS,
                        message: 'Nhập dữ liệu thành công',
                    };
                },
                errorNotification: (error) => {
                    return {
                        type: MessageType.ERROR,
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
                    type: MessageType.ERROR,
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
            <CustomFlex justify="end" align="center" gap={16}>
                {currentStep === StepEnum.Upload && (
                    <CustomButton type="primary" onClick={handleImportFile}>
                        Nhập dữ liệu
                    </CustomButton>
                )}

                {currentStep === StepEnum.Preview && (
                    <>
                        <CustomButton
                            type="primary"
                            onClick={() => handleChangeStep(StepEnum.Upload)}
                        >
                            Quay lại
                        </CustomButton>
                        <CustomButton type="primary" onClick={handleImportItem}>
                            Nhập dữ liệu
                        </CustomButton>
                    </>
                )}

                <CustomButton
                    onClick={() => {
                        onClose();
                        if (currentStep === StepEnum.CustomResult) {
                            onSuccess?.();
                        }
                    }}
                >
                    Đóng
                </CustomButton>
            </CustomFlex>
        );
    };

    const renderUploadStep = () => {
        return (
            <CustomCard variant="borderless" className="shadow-sm">
                <CustomUpload.Dragger
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
                </CustomUpload.Dragger>
            </CustomCard>
        );
    };

    const renderPreviewStep = () => {
        if (!previewItemData) return <></>;

        const { updates, overridden, errors } = previewItemData?.statistics ?? {};

        return (
            <CustomSpace direction="vertical" className="w-full h-full">
                <CustomCard className="shadow-sm" variant="borderless">
                    <div className="grid gap-6 grid-cols-3">
                        <CustomCard className="text-center bg-hub-active border-hub-border">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng được cập nhật
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{updates ?? 0}</div>
                        </CustomCard>
                        <CustomCard className="text-center bg-hub-active border-hub-border">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng được ghi đè
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">
                                {overridden ?? 0}
                            </div>
                        </CustomCard>
                        <CustomCard className="text-center bg-hub-active border-hub-border">
                            <p className="text-sm text-gray-600 font-bold mt-1">
                                Số đối tượng có lỗi
                            </p>
                            <div className="text-blue-600 text-2xl font-bold">{errors ?? 0}</div>
                        </CustomCard>
                    </div>
                </CustomCard>
                <CustomDataTable
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
            </CustomSpace>
        );
    };

    const renderResultStep = () => {
        if (!importItemData) return <></>;

        return (
            <CustomSpace direction="vertical" className="w-full h-full">
                <CustomResult
                    status={importItemData?.success ? 'success' : 'warning'}
                    subTitle={`Cập nhật ${importItemData?.updated ?? 0} đối tượng`}
                    title={
                        importItemData?.success
                            ? 'Nhập dữ liệu thành công'
                            : 'Nhập dữ liệu thất bại'
                    }
                />
                {!!importItemData?.validationErrorMessages?.length && (
                    <CustomDataTable
                        bordered
                        size="small"
                        pagination={{ pageSize: 20, showSizeChanger: true }}
                        dataSource={importItemData.validationErrorMessages.map(
                            (message: string, index: number) => ({
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
                                    <CustomTypography.Text type="danger">
                                        {text}
                                    </CustomTypography.Text>
                                ),
                            },
                        ]}
                    />
                )}
            </CustomSpace>
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

            case StepEnum.CustomResult: {
                return renderResultStep();
            }
        }
    };

    return (
        <FormModalLayout
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
            <CustomSpace direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                <CustomCard className="mb-4 bg-green-50 border-green-200" size="small">
                    <CustomSteps
                        items={steps}
                        size="default"
                        current={currentStep}
                        onChange={handleChangeStep}
                    />
                </CustomCard>

                <CustomSpin spinning={isLoading}>
                    <CustomSpace size="middle" direction="vertical" className="w-full h-full">
                        {renderContent()}
                    </CustomSpace>
                </CustomSpin>
            </CustomSpace>
        </FormModalLayout>
    );
};
