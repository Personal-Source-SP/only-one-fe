'use client';

import { CustomModal } from '@/components/common';
import { GoogleDriveType } from '@/enums';
import { NBaseApi, NGoogle } from '@/interfaces';
import { exchangeCodeForTokens, getGoogleAuthUrl, isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import { useApiUrl, useCustomMutation } from '@refinedev/core';
import {
    Button,
    Card,
    Col,
    Flex,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Spin,
    StepProps,
    Steps,
    Table,
} from 'antd';
import { ColumnType } from 'antd/es/table';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FC, memo, useEffect, useState } from 'react';

const StepEnum = {
    Settings: 0,
    Preview: 1,
    Done: 2,
};

export type SyncFileGoogleDriveProps = {
    onClose: (isOpen: boolean) => void;
    isLoadingGoogleAuth?: boolean;
    googleAuth?: NGoogle.IGoogleAuth;
};

const SyncFileGoogleDrive: FC<SyncFileGoogleDriveProps> = ({
    onClose,
    googleAuth,
    isLoadingGoogleAuth,
}) => {
    const apiUrl = useApiUrl();
    const searchParams = useSearchParams();

    const { mutate: syncGoogleAuth } = useCustomMutation<NBaseApi.IResponse<boolean>>();
    const { mutate: previewGoogleDrive, mutation: previewGoogleDriveMutation } =
        useCustomMutation<NBaseApi.IResponse<NGoogle.IPreviewGoogleDriveData>>();

    const [form] = Form.useForm();
    const type = Form.useWatch('type', form);

    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);

    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [previewData, setPreviewData] = useState<NGoogle.IGoogleDrivePreviewItem[]>([]);

    useEffect(() => {
        const googleToken = googleAuth?.googleAccessToken;
        const googleExpiresAt = googleAuth?.googleExpiresAt;

        if (googleToken && googleExpiresAt) {
            const expiryDate = new Date(googleExpiresAt as unknown as string);
            const isExpired = isExpiredToken(expiryDate);
            setIsAuthenticated(!isExpired);
        } else {
            setIsAuthenticated(false);
        }
    }, [googleAuth]);

    useEffect(() => {
        if (!searchParams) return;

        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            message.error('Kết nối Google thất bại');
            return;
        }

        if (code) {
            handleSaveToken(code as string);
        }
    }, [searchParams]);

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
        },
        {
            title: 'ID Drive',
            dataIndex: 'googleDriveId',
            key: 'googleDriveId',
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'Loại tệp',
            dataIndex: 'mimeType',
            key: 'mimeType',
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'Kích thước (bytes)',
            dataIndex: 'size',
            key: 'size',
            ellipsis: true,
            width: '15%',
            render: (size?: number) => (size ? size.toLocaleString() : '---'),
        },
        {
            title: 'Đường dẫn xem',
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
        },
    ];

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

    const handleSaveToken = async (code: string) => {
        setLoading(true);

        try {
            const tokens = await exchangeCodeForTokens(
                code,
                process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI as string,
            );

            if (!tokens) {
                message.error('Lỗi khi lấy token Google');
                return;
            }

            syncGoogleAuth({
                method: 'put',
                url: `${apiUrl}/google-auth`,
                values: {
                    accessToken: tokens.access_token,
                    expiresIn: tokens.expires_in,
                    scope: tokens.scope,
                    tokenType: tokens.token_type,
                    refreshToken: tokens.refresh_token,
                    refreshTokenExpiresIn: tokens.refresh_token_expires_in,
                },
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Kết nối Google thất bại',
                        };
                    }

                    // Remove all params from URL (e.g., ?code=xxx)
                    if (typeof window !== 'undefined' && window.location) {
                        const cleanUrl = window.location.origin + window.location.pathname;
                        window.history.replaceState({}, document.title, cleanUrl);
                    }

                    return {
                        type: 'success',
                        message: 'Kết nối Google thành công',
                    };
                },
                errorNotification: () => {
                    return {
                        type: 'error',
                        message: 'Kết nối Google thất bại',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi kết nối Google');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewData = async () => {
        setLoading(true);

        try {
            const values = form.getFieldsValue();

            previewGoogleDrive({
                method: 'post',
                url: `${apiUrl}/google-drive/preview-data-sync`,
                values: {
                    type: values.type,
                    query: values.query,
                    folderId: values.folderId,
                    pageSize: values.pageSize,
                    maxResults: values.maxResults,
                },
                successNotification: (data) => {
                    if (!data?.data?.data) {
                        return {
                            type: 'error',
                            message: 'Lỗi khi xem trước dữ liệu đồng bộ',
                        };
                    }

                    setCurrentStep(StepEnum.Preview);
                    setPreviewData(data?.data?.data?.data || []);
                    setHasMore(data?.data?.data?.hasMore || false);
                    setTotalCount(data?.data?.data?.totalCount || 0);

                    return {
                        type: 'success',
                        message: 'Xem trước dữ liệu đồng bộ thành công',
                    };
                },
                errorNotification: () => {
                    setCurrentStep(StepEnum.Settings);

                    return {
                        type: 'error',
                        message: 'Lỗi khi xem trước dữ liệu đồng bộ',
                    };
                },
            });
        } catch (e) {
            message.error('Lỗi khi xem trước dữ liệu đồng bộ');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderFooter = () => {
        if (!isAuthenticated) {
            return (
                <Flex justify="space-between" align="center" gap={16}>
                    <Button
                        className="w-full"
                        loading={loading}
                        onClick={() => onClose(false)}
                        icon={<Icon icon="lucide:x" />}
                    >
                        <span>Đóng</span>
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
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
                    loading={loading}
                    icon={<Icon icon="lucide:x" />}
                    onClick={() => onClose(false)}
                >
                    <span>Đóng</span>
                </Button>

                {currentStep === StepEnum.Preview && (
                    <Button
                        type="primary"
                        className="w-full"
                        loading={loading}
                        icon={<Icon icon="lucide:sync" />}
                        // onClick={handleSyncData}
                    >
                        <span>Đồng bộ</span>
                    </Button>
                )}

                {currentStep !== StepEnum.Settings && (
                    <Button
                        type="primary"
                        className="w-full"
                        loading={loading}
                        icon={<Icon icon="lucide:arrow-left" />}
                        onClick={() => handleChangeStep(currentStep - 1)}
                    >
                        <span>Quay lại</span>
                    </Button>
                )}

                {currentStep === StepEnum.Settings && (
                    <Button
                        type="primary"
                        className="w-full"
                        loading={loading}
                        onClick={() => handlePreviewData()}
                        icon={<Icon icon="lucide:arrow-right" />}
                    >
                        <span>Tiếp theo</span>
                    </Button>
                )}
            </Flex>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case StepEnum.Settings: {
                return (
                    <Space direction="vertical" size="small" className="!w-full h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ type: GoogleDriveType.FILE }}
                        >
                            <Form.Item
                                name="type"
                                label="Loại đồng bộ"
                                rules={[{ required: true, message: 'Vui lòng chọn loại đồng bộ' }]}
                            >
                                <Select
                                    placeholder="Loại đồng bộ"
                                    defaultValue={GoogleDriveType.FILE}
                                    options={Object.values(GoogleDriveType).map((type) => ({
                                        value: type,
                                        label: type?.toLocaleUpperCase(),
                                    }))}
                                />
                            </Form.Item>
                            <Form.Item
                                name="folderId"
                                label="Thư mục"
                                rules={[
                                    {
                                        message: 'Vui lòng chọn thư mục',
                                        required: type === GoogleDriveType.FILE,
                                    },
                                ]}
                            >
                                <Select placeholder="Thư mục" />
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
                            <Form.Item name="query" label="Chỉnh sửa tìm kiếm">
                                <Input.TextArea placeholder="Chỉnh sửa tìm kiếm" rows={4} />
                            </Form.Item>
                        </Form>
                    </Space>
                );
            }

            case StepEnum.Preview: {
                return (
                    <Space size="middle" direction="vertical" className="!w-full h-full">
                        <Spin spinning={previewGoogleDriveMutation.isPending}>
                            <Card className="shadow-sm">
                                <div className="grid grid-cols-2 gap-6">
                                    <Card className="text-center bg-blue-50 border-blue-200">
                                        <div className="text-blue-600 text-2xl font-bold">
                                            {totalCount ?? 0}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Tổng số lượng
                                        </div>
                                    </Card>
                                    <Card className="text-center bg-green-50 border-green-200">
                                        <div className="text-green-600 text-2xl flex items-center justify-center">
                                            {hasMore ? (
                                                <Icon icon="lucide:check" />
                                            ) : (
                                                <Icon icon="lucide:x" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Có thêm dữ liệu
                                        </div>
                                    </Card>
                                </div>
                            </Card>
                            <Table
                                bordered
                                size="small"
                                dataSource={previewData || []}
                                pagination={{ pageSize: 50, showSizeChanger: true }}
                                columns={columns as ColumnType<NGoogle.IGoogleDrivePreviewItem>[]}
                                rowKey={(record: NGoogle.IGoogleDrivePreviewItem, index) =>
                                    `${record.googleDriveId}-${index}`
                                }
                            />
                        </Spin>
                    </Space>
                );
            }

            case StepEnum.Done: {
                return (
                    <Space direction="vertical" size="middle" className="!w-full h-full"></Space>
                );
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
            {isAuthenticated && (
                <>
                    <Steps
                        items={steps}
                        size="default"
                        current={currentStep}
                        className="mb-8 px-4"
                        onChange={handleChangeStep}
                    />

                    <section className="w-full overflow-x-hidden">{renderContent()}</section>
                </>
            )}
        </CustomModal>
    );
};

export default memo(SyncFileGoogleDrive);
