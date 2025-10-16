'use client';

import { CustomModal } from '@/components/common';
import { GoogleDriveFileType, GoogleDriveType } from '@/enums';
import { NBaseApi, NGoogle, Option } from '@/interfaces';
import { getGoogleAuthUrl, isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import {
    Button,
    Card,
    Checkbox,
    CheckboxChangeEvent,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    InputNumber,
    message,
    Result,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    StepProps,
    Steps,
    Table,
    Tag,
} from 'antd';
import { ColumnType, TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, memo, useEffect, useState, type Key } from 'react';

const StepEnum = {
    Settings: 0,
    Preview: 1,
    Done: 2,
};

export type SyncFileGoogleDriveProps = {
    onClose: (isOpen: boolean) => void;
    folderOptions?: Option[];
    isLoadingGoogleAuth?: boolean;
    googleAuth?: NGoogle.IGoogleAuth;
};

const SyncFileGoogleDrive: FC<SyncFileGoogleDriveProps> = ({
    onClose,
    folderOptions,
    googleAuth,
    isLoadingGoogleAuth,
}) => {
    const apiUrl = useApiUrl();

    const { mutate: syncGoogleDrive } = useCustomMutation<NBaseApi.IResponse<boolean>>();
    const { mutate: previewGoogleDrive } =
        useCustomMutation<NBaseApi.IResponse<NGoogle.IPreviewGoogleDriveData>>();

    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);

    const [type, setType] = useState(GoogleDriveType.FILE);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);
    const [fileTypes, setFileTypes] = useState<GoogleDriveFileType[]>([]);
    const [folderId, setFolderId] = useState<string | undefined>(undefined);
    const [googleAuthId, setGoogleAuthId] = useState<string | undefined>(undefined);

    const [pageSize, setPageSize] = useState(50);
    const [hasMore, setHasMore] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [updateAll, setUpdateAll] = useState(false);
    const [previewData, setPreviewData] = useState<NGoogle.IGoogleDrivePreviewItem[]>([]);
    const [selectedRows, setSelectedRows] = useState<NGoogle.IGoogleDrivePreviewItem[]>([]);

    useEffect(() => {
        const googleAuthId = googleAuth?.id;
        const googleToken = googleAuth?.googleAccessToken;
        const googleExpiresAt = googleAuth?.googleExpiresAt;

        if (googleToken && googleExpiresAt) {
            const expiryDate = new Date(googleExpiresAt as unknown as string);
            const isExpired = isExpiredToken(expiryDate);

            setGoogleAuthId(isExpired ? undefined : googleAuthId);
        } else {
            setGoogleAuthId(undefined);
        }
    }, [googleAuth]);

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

    const columns: ColumnType<NGoogle.IGoogleDrivePreviewItem>[] = [
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
            dataIndex: 'webViewLink',
            key: 'webViewLink',
            ellipsis: true,
            width: '10%',
            render: (link?: string) =>
                link ? (
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                        Xem
                    </Link>
                ) : (
                    '---'
                ),
        },
        {
            title: 'Đã xóa?',
            dataIndex: 'isTrashed',
            key: 'isTrashed',
            width: '10%',
            align: 'center',
            render: (trashed?: boolean) =>
                trashed ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            sorter: (a, b) => Number(Boolean(a.isTrashed)) - Number(Boolean(b.isTrashed)),
        },
        {
            title: 'Gắn sao?',
            dataIndex: 'isStarred',
            key: 'isStarred',
            width: '10%',
            align: 'center',
            render: (starred?: boolean) =>
                starred ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
            sorter: (a, b) => Number(Boolean(a.isStarred)) - Number(Boolean(b.isStarred)),
        },
    ];

    const rowSelection: TableProps<NGoogle.IGoogleDrivePreviewItem>['rowSelection'] = {
        type: 'checkbox',
        onChange: (_: Key[], selectedRows: NGoogle.IGoogleDrivePreviewItem[]) => {
            setSelectedRows([...selectedRows]);
        },
        getCheckboxProps: (record: NGoogle.IGoogleDrivePreviewItem) => ({
            name: record.name,
        }),
    };

    const handleGoogleAuth = async () => {
        setLoading(true);

        try {
            const url = getGoogleAuthUrl();

            if (!url) {
                message.error('Lỗi khi tạo URL kết nối Google');
                return;
            }

            window.location.href = url;
        } catch (e) {
            message.error('Lỗi khi tạo URL kết nối Google');
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
            previewGoogleDrive({
                method: 'post',
                url: `${apiUrl}/google-drive/preview-data-sync`,
                values: {
                    ...values,
                    type,
                    googleAuthId,
                },
                successNotification: (data) => {
                    setLoading(false);

                    if (!data?.data?.data) {
                        setCurrentStep(StepEnum.Settings);

                        return {
                            type: 'error',
                            message: 'Lỗi khi xem trước dữ liệu đồng bộ',
                        };
                    }

                    setCurrentStep(StepEnum.Preview);
                    setPreviewData(data?.data?.data?.data || []);
                    setHasMore(data?.data?.data?.hasMore || false);
                    setTotalSize(data?.data?.data?.totalSize || 0);
                    setTotalCount(data?.data?.data?.totalCount || 0);

                    return undefined;
                },
                errorNotification: () => {
                    setLoading(false);
                    setCurrentStep(StepEnum.Settings);

                    return {
                        type: 'error',
                        message: 'Lỗi khi xem trước dữ liệu đồng bộ',
                    };
                },
            });
        } catch (e) {
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
            syncGoogleDrive({
                method: 'put',
                url: `${apiUrl}/google-drive/save-data-sync`,
                values: {
                    type,
                    folderId,
                    googleAuthId,
                    data: selectedRows,
                },
                successNotification: (data) => {
                    setLoading(false);

                    if (!data?.data?.data) {
                        setCurrentStep(StepEnum.Preview);

                        return {
                            type: 'error',
                            message: 'Lỗi khi đồng bộ dữ liệu',
                        };
                    }

                    setCurrentStep(StepEnum.Done);

                    return undefined;
                },
                errorNotification: () => {
                    setLoading(false);
                    setCurrentStep(StepEnum.Preview);

                    return {
                        type: 'error',
                        message: 'Lỗi khi đồng bộ dữ liệu',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi đồng bộ dữ liệu');
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
                initialValues={{ type: GoogleDriveType.FILE, maxResults: 100, folderId: '' }}
            >
                <Form.Item
                    name="type"
                    label="Loại đồng bộ"
                    rules={[{ required: true, message: 'Vui lòng chọn loại đồng bộ' }]}
                >
                    <Select
                        placeholder="Loại đồng bộ"
                        defaultValue={GoogleDriveType.FILE}
                        onChange={(value) => setType(value as GoogleDriveType)}
                        options={Object.values(GoogleDriveType).map((type) => ({
                            value: type,
                            label: type?.toUpperCase(),
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    name="folderId"
                    label="Thư mục"
                    rules={[{ required: true, message: 'Vui lòng chọn thư mục' }]}
                >
                    <Select
                        allowClear
                        showSearch
                        placeholder="Thư mục"
                        defaultValue={''}
                        onChange={(value) => setFolderId(value === '' ? undefined : value)}
                        options={[{ value: '', label: 'Tất cả thư mục' }, ...(folderOptions ?? [])]}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="maxResults" label="Số lượng">
                            <InputNumber min={1} placeholder="Số lượng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="pageSize" label="Kích thước trang">
                            <InputNumber min={1} placeholder="Kích thước trang" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="fileTypes" label="Loại tệp">
                    <Select
                        mode="multiple"
                        placeholder="Loại tệp"
                        onChange={(value) => setFileTypes(value as GoogleDriveFileType[])}
                        options={Object.values(GoogleDriveFileType).map((type) => ({
                            value: type,
                            label: type?.toUpperCase(),
                        }))}
                    />
                </Form.Item>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="modifiedTimeFrom" label="Từ ngày">
                            <DatePicker placeholder="Chọn ngày bắt đầu" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="modifiedTimeTo" label="Đến ngày">
                            <DatePicker placeholder="Chọn ngày kết thúc" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="customQuery" label="Chỉnh sửa tìm kiếm">
                    <Input.TextArea placeholder="Chỉnh sửa tìm kiếm" rows={4} />
                </Form.Item>
            </Form>
        );
    };

    const renderPreviewStep = () => {
        return (
            <Space direction="vertical" className="w-full h-full">
                <Card className="shadow-sm" variant="borderless">
                    <div className="grid grid-cols-4 gap-6">
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
                            <p className="text-sm text-gray-600 font-bold mt-1">Có thêm dữ liệu</p>
                            <div className="text-green-600 text-2xl flex items-center justify-center">
                                {hasMore ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />}
                            </div>
                        </Card>
                        <Card className="text-center bg-purple-50 border-purple-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">Loại file</p>
                            <div className="flex flex-wrap justify-center gap-2 my-2">
                                {fileTypes?.map((mime) => (
                                    <Tag color="blue" key={mime}>
                                        {mime?.toUpperCase()}
                                    </Tag>
                                ))}
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
                    rowKey="googleDriveId"
                    rowSelection={rowSelection}
                    dataSource={previewData || []}
                    columns={columns as ColumnType<NGoogle.IGoogleDrivePreviewItem>[]}
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
        if (!googleAuthId) {
            return (
                <Flex justify="space-between" align="center" gap={16}>
                    <Button
                        className="w-full"
                        onClick={() => onClose(false)}
                        icon={<Icon icon="lucide:x" />}
                    >
                        <span>Đóng</span>
                    </Button>
                    <Button
                        type="primary"
                        className="w-full"
                        onClick={handleGoogleAuth}
                        icon={<Icon icon="lucide:google" />}
                    >
                        Kết nối Google
                    </Button>
                </Flex>
            );
        }

        return (
            <Flex justify="space-between" align="center" gap={16}>
                <Button
                    className="w-full"
                    icon={<Icon icon="lucide:x" />}
                    onClick={() => onClose(false)}
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
                open: true,
                width: 1200,
                centered: true,
                footer: renderFooter(),
                loading: isLoadingGoogleAuth,
                title: 'Đồng bộ Google Drive',
            }}
        >
            <Spin spinning={loading}>
                {Boolean(googleAuthId) && (
                    <Space direction="vertical" className="w-full h-full px-3 overflow-x-hidden">
                        <Card className="mb-4 bg-amber-50 border-amber-200" size="small">
                            <Flex justify="space-between" align="center">
                                <Space size="small">
                                    <Icon icon="lucide:timer" />
                                    <span>Token hết hạn sau</span>
                                </Space>
                                <Statistic.Countdown
                                    value={new Date(
                                        (googleAuth?.googleExpiresAt as unknown as string) || '',
                                    ).getTime()}
                                    format="HH:mm:ss"
                                    onFinish={() => {
                                        message.info('Token đã hết hạn. Vui lòng kết nối lại.');
                                        setGoogleAuthId(undefined);
                                    }}
                                />
                            </Flex>
                        </Card>

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

export default memo(SyncFileGoogleDrive);
