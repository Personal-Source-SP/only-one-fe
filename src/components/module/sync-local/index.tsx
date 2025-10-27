'use client';

import { CustomModal } from '@/components/custom';
import { GoogleDriveFileType, GoogleDriveType } from '@/enums';
import { useCustomMutationData } from '@/hooks';
import { NGoogle, Option } from '@/interfaces';
import { Icon } from '@iconify/react';
import {
    Button,
    Card,
    Checkbox,
    CheckboxChangeEvent,
    Col,
    DatePicker,
    Flex,
    Form,
    InputNumber,
    message,
    Result,
    Row,
    Select,
    Space,
    Spin,
    StepProps,
    Steps,
    Table,
} from 'antd';
import { ColumnType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, memo, useEffect, useState, type Key } from 'react';

const StepEnum = {
    Settings: 0,
    Preview: 1,
    Done: 2,
};

const FieldsEnum = {
    GoogleAuthId: 'googleAuthId',
    Type: 'type',
    FolderId: 'folderId',
    MaxResults: 'maxResults',
    FileTypes: 'fileTypes',
    ModifiedTimeFrom: 'modifiedTimeFrom',
    ModifiedTimeTo: 'modifiedTimeTo',
};

type SyncLocalProps = {
    isOpen: boolean;
    queryLoading: boolean;
    folderOptions: Option[];
    onClose: () => void;
    onSuccess: () => void;
};

interface IFormValues {
    type: GoogleDriveType;
    folderId?: string;
    maxResults?: number;
    fileTypes?: GoogleDriveFileType[];
    modifiedTimeTo?: string;
    modifiedTimeFrom?: string;
}

const SyncLocal: FC<SyncLocalProps> = ({
    isOpen,
    queryLoading,
    folderOptions,
    onSuccess,
    onClose,
}) => {
    const { apiUrl } = useCustomMutationData();

    const [form] = Form.useForm<IFormValues>();

    const [loading, setLoading] = useState(false);
    const [isPermissionsGranted, setIsPermissionsGranted] = useState(false);
    const [directoryHandle, setDirectoryHandle] = useState<any>(null);

    const [type, setType] = useState(GoogleDriveType.FILE);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);
    const [fileTypes, setFileTypes] = useState<GoogleDriveFileType[]>([]);
    const [folderId, setFolderId] = useState<string | undefined>(undefined);

    const [pageSize, setPageSize] = useState(50);
    const [hasMore, setHasMore] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [updateAll, setUpdateAll] = useState(false);
    const [previewData, setPreviewData] = useState<NGoogle.ILocalFilePreviewItem[]>([]);
    const [selectedRows, setSelectedRows] = useState<NGoogle.ILocalFilePreviewItem[]>([]);

    useEffect(() => {
        setSelectedRows([]);
    }, [previewData]);

    const steps: StepProps[] = [
        {
            title: 'Cài đặt',
            icon: <Icon icon="lucide:settings" />,
            status: currentStep === StepEnum.Settings ? 'process' : 'finish',
        },
        {
            title: 'Xem trước',
            icon: <Icon icon="lucide:eye" />,
            status: currentStep === StepEnum.Preview ? 'process' : 'finish',
        },
        {
            title: 'Hoàn tất',
            icon: <Icon icon="lucide:check" />,
            status: currentStep === StepEnum.Done ? 'process' : 'finish',
        },
    ];

    const columns: ColumnType<NGoogle.ILocalFilePreviewItem>[] = [
        {
            title: 'Tên tệp',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: '25%',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            key: 'lastModified',
            title: 'Ngày chỉnh sửa',
            dataIndex: 'lastModified',
            ellipsis: true,
            width: '15%',
            render: (lastModified?: Date) =>
                lastModified ? dayjs(lastModified).format('DD/MM/YYYY HH:mm:ss') : '---',
            sorter: (a, b) =>
                (a.lastModified ? new Date(a.lastModified as unknown as string).getTime() : 0) -
                (b.lastModified ? new Date(b.lastModified as unknown as string).getTime() : 0),
        },
        {
            title: 'Loại tệp',
            dataIndex: 'mimeType',
            key: 'mimeType',
            ellipsis: true,
            width: '15%',
            sorter: (a, b) => (a.mimeType || '').localeCompare(b.mimeType || ''),
        },
        {
            title: 'Kích thước (bytes)',
            dataIndex: 'size',
            key: 'size',
            ellipsis: true,
            width: '15%',
            render: (size?: number) => (size ? size.toLocaleString() : '---'),
            sorter: (a, b) => (a.size || 0) - (b.size || 0),
        },
        {
            title: 'Đường dẫn',
            dataIndex: 'name',
            key: 'path',
            ellipsis: true,
            width: '20%',
            render: (name: string) => name,
        },
    ];

    const rowSelection: TableProps<NGoogle.ILocalFilePreviewItem>['rowSelection'] = {
        type: 'checkbox',
        onChange: (_: Key[], selectedRows: NGoogle.ILocalFilePreviewItem[]) => {
            setSelectedRows([...selectedRows]);
        },
        getCheckboxProps: (record: NGoogle.ILocalFilePreviewItem) => ({
            name: record.name,
        }),
    };

    const handleRequestFileAccess = async () => {
        setLoading(true);

        try {
            if (!('showOpenFilePicker' in window)) {
                message.error('Trình duyệt không hỗ trợ File System Access API');
                setLoading(false);
                return;
            }

            const directoryHandle = await (window as any).showDirectoryPicker({
                mode: 'read',
                startIn: 'documents',
            });

            if (directoryHandle) {
                setDirectoryHandle(directoryHandle);
                setIsPermissionsGranted(true);
                message.success('Đã cấp quyền truy cập thư mục thành công');
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                message.info('Người dùng đã hủy việc chọn thư mục');
            } else {
                message.error('Lỗi khi yêu cầu quyền truy cập thư mục: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPreviewData = () => {
        setPreviewData([]);
        setHasMore(false);
        setTotalSize(0);
        setTotalCount(0);
        setPageSize(50);
    };

    const scanDirectoryFiles = async (dirHandle: any, fileTypes: string[] = []): Promise<any[]> => {
        const files: any[] = [];

        try {
            for await (const [name, handle] of dirHandle.entries()) {
                if (handle.kind === 'file') {
                    const file = await handle.getFile();
                    const mimeType = file.type;

                    if (fileTypes.length === 0 || fileTypes.includes(mimeType)) {
                        files.push({
                            name: name,
                            size: file.size,
                            lastModified: file.lastModified,
                            mimeType: mimeType,
                            file: file,
                            handle: handle,
                        });
                    }
                } else if (handle.kind === 'directory') {
                    const subFiles = await scanDirectoryFiles(handle, fileTypes);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            console.error('Error scanning directory:', error);
        }

        return files;
    };

    const handlePreviewData = async () => {
        setLoading(true);
        handleResetPreviewData();

        let values;
        try {
            values = await form.validateFields();
        } catch (e) {
            setLoading(false);
            return;
        }

        try {
            if (!directoryHandle) {
                message.error('Chưa chọn thư mục');
                setLoading(false);
                return;
            }

            const fileTypes = values.fileTypes || [];
            const files = await scanDirectoryFiles(directoryHandle, fileTypes);

            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            const totalCount = files.length;

            setCurrentStep(StepEnum.Preview);
            setPreviewData(files);
            setHasMore(false);
            setTotalSize(totalSize);
            setTotalCount(totalCount);

            setLoading(false);
        } catch (e) {
            setLoading(false);
            message.error('Lỗi khi xem trước dữ liệu đồng bộ');
        }
    };

    const handleSyncData = async () => {
        if (!selectedRows?.length) {
            message.error('Không có dữ liệu để đồng bộ');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            selectedRows.forEach((file, index) => {
                if (file.file) {
                    formData.append(`files`, file.file);
                }
            });

            formData.append('type', type);
            if (folderId) {
                formData.append('folderId', folderId);
            }

            const response = await fetch(`${apiUrl}/local-files/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setCurrentStep(StepEnum.Done);
                message.success('Đồng bộ dữ liệu thành công');
            } else {
                setCurrentStep(StepEnum.Preview);
                message.error('Lỗi khi đồng bộ dữ liệu');
            }
        } catch (e) {
            setCurrentStep(StepEnum.Preview);
            message.error('Lỗi khi đồng bộ dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderSettingStep = () => {
        return (
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    folderId: '',
                    maxResults: 100,
                    type: GoogleDriveType.FILE,
                }}
            >
                <Row gutter={[16, 0]}>
                    <Col span={12}>
                        <Form.Item
                            label="Loại đồng bộ"
                            name={FieldsEnum.Type}
                            rules={[{ required: true, message: 'Vui lòng chọn loại đồng bộ' }]}
                        >
                            <Select
                                placeholder="Loại đồng bộ"
                                defaultValue={GoogleDriveType.FILE}
                                onChange={(value) => {
                                    setType(value as GoogleDriveType);

                                    if (value === GoogleDriveType.FOLDER) {
                                        form.setFieldValue(
                                            FieldsEnum.FileTypes as keyof IFormValues,
                                            undefined,
                                        );
                                    }
                                }}
                                options={Object.values(GoogleDriveType).map((type) => ({
                                    value: type,
                                    label: type?.toUpperCase(),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Thư mục"
                            name={FieldsEnum.FolderId}
                            rules={[{ required: true, message: 'Vui lòng chọn thư mục' }]}
                        >
                            <Select
                                allowClear
                                showSearch
                                defaultValue={''}
                                placeholder="Thư mục"
                                onChange={(value) => setFolderId(value === '' ? undefined : value)}
                                options={[
                                    { value: '', label: 'Tất cả thư mục' },
                                    ...(folderOptions ?? []),
                                ]}
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={FieldsEnum.MaxResults} label="Số lượng">
                            <InputNumber min={1} placeholder="Số lượng" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name={FieldsEnum.FileTypes} label="Loại tệp">
                            <Select
                                mode="multiple"
                                placeholder="Loại tệp"
                                disabled={type === GoogleDriveType.FOLDER}
                                onChange={(value) => setFileTypes(value as GoogleDriveFileType[])}
                                options={Object.values(GoogleDriveFileType).map((type) => ({
                                    value: type,
                                    label: type?.toUpperCase(),
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={FieldsEnum.ModifiedTimeFrom} label="Từ ngày">
                            <DatePicker placeholder="Chọn ngày bắt đầu" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={FieldsEnum.ModifiedTimeTo} label="Đến ngày">
                            <DatePicker placeholder="Chọn ngày kết thúc" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        );
    };

    const renderPreviewStep = () => {
        return (
            <Space direction="vertical" className="w-full h-full">
                <Card className="shadow-sm" variant="borderless">
                    <div className="grid gap-6 grid-cols-3">
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">Tổng số lượng</p>
                            <div className="text-blue-600 text-2xl font-bold">
                                {totalCount ?? 0}
                            </div>
                        </Card>
                        <Card className="text-center bg-blue-50 border-blue-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">Tổng kích thước</p>
                            <div className="text-blue-600 text-2xl font-bold">{totalSize ?? 0}</div>
                        </Card>
                        <Card className="text-center bg-green-50 border-green-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">Thư mục đã chọn</p>
                            <div className="text-green-600 text-2xl flex items-center justify-center">
                                {directoryHandle ? (
                                    <Icon icon="lucide:check" />
                                ) : (
                                    <Icon icon="lucide:x" />
                                )}
                            </div>
                        </Card>
                    </div>
                </Card>
                <div className="flex items-center mb-2">
                    <Checkbox
                        checked={updateAll}
                        onChange={(e: CheckboxChangeEvent) => {
                            setUpdateAll(e.target.checked);

                            if (e.target.checked) {
                                setSelectedRows(previewData);
                            } else {
                                setSelectedRows([]);
                            }
                        }}
                    >
                        Đồng bộ tất cả
                    </Checkbox>
                </div>
                <Table
                    bordered
                    size="small"
                    rowKey="name"
                    rowSelection={rowSelection}
                    dataSource={previewData || []}
                    columns={columns}
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

    const renderFooter = () => {
        if (!isPermissionsGranted) {
            return (
                <Flex justify="space-between" align="center" gap={16}>
                    <Button onClick={onClose} className="w-full" icon={<Icon icon="lucide:x" />}>
                        <span>Đóng</span>
                    </Button>
                    <Button
                        type="primary"
                        className="w-full"
                        onClick={handleRequestFileAccess}
                        icon={<Icon icon="lucide:folder-open" />}
                    >
                        Chọn thư mục
                    </Button>
                </Flex>
            );
        }

        return (
            <Flex justify="space-between" align="center" gap={16}>
                <Button
                    className="w-full"
                    icon={<Icon icon="lucide:x" />}
                    onClick={() => {
                        onClose();

                        if (currentStep === StepEnum.Done) {
                            onSuccess();
                        }
                    }}
                >
                    <span>Đóng</span>
                </Button>

                {currentStep === StepEnum.Preview && (
                    <>
                        <Button
                            type="primary"
                            className="w-full"
                            onClick={handleSyncData}
                            icon={<Icon icon="lucide:sync" />}
                        >
                            <span>Đồng bộ</span>
                        </Button>
                        <Button
                            type="primary"
                            className="w-full"
                            icon={<Icon icon="lucide:arrow-left" />}
                            onClick={() => handleChangeStep(currentStep - 1)}
                        >
                            <span>Quay lại</span>
                        </Button>
                    </>
                )}

                {currentStep === StepEnum.Settings && (
                    <Button
                        type="primary"
                        className="w-full"
                        icon={<Icon icon="lucide:arrow-right" />}
                        onClick={() => {
                            setCurrentStep(StepEnum.Preview);
                            handlePreviewData();
                        }}
                    >
                        <span>Tiếp theo</span>
                    </Button>
                )}
            </Flex>
        );
    };

    const renderDoneStep = () => {
        return <Result status="success" title="Đồng bộ dữ liệu thành công" />;
    };

    const renderContent = () => {
        switch (currentStep) {
            case StepEnum.Settings: {
                return renderSettingStep();
            }

            case StepEnum.Preview: {
                return renderPreviewStep();
            }

            case StepEnum.Done: {
                return renderDoneStep();
            }
        }
    };

    return (
        <CustomModal
            modalProps={{
                width: 1200,
                open: isOpen,
                centered: true,
                loading: queryLoading,
                footer: renderFooter(),
                title: 'Đồng bộ từ thư mục máy tính',
            }}
        >
            <Spin spinning={loading}>
                {isPermissionsGranted && (
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
                )}
            </Spin>
        </CustomModal>
    );
};

export default memo(SyncLocal);
