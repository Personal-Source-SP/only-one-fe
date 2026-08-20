'use client';

import {
    CheckboxChangeEvent,
    ColumnType,
    CustomButton,
    CustomCard,
    CustomCheckbox,
    CustomCol,
    CustomPicker,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomInputNumber,
    CustomModal,
    CustomResult,
    CustomRow,
    CustomSelect,
    CustomSpace,
    CustomSpin,
    CustomStatistic,
    CustomSteps,
    CustomDataTable,
    CustomTag,
    StepsProps,
    TableProps,
} from '@/components/custom-antd';
import { MessageType } from '@/enums';
import { useMainContext } from '@/contexts/MainContext';
import { GoogleDriveType, MimeType } from '@/enums';
import { useCustomData, useCustomMutationData, useSelectGoogleFolder } from '@/hooks';
import type { IDataOption } from '@/interfaces';
import { formatDate, getGoogleAuthUrl, isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect, useMemo, useState, type Key } from 'react';
import type { IGoogleAuth, IGoogleDrivePreviewItem } from '@/app/(root)/google/drive/photos/types';

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
    CustomQuery: 'customQuery',
};

type SyncGoogleDriveProps = {
    isOpen: boolean;
    queryLoading: boolean;
    defaultType?: GoogleDriveType;
    defaultFolderOptions?: IDataOption[];
    defaultGoogleAuths?: IGoogleAuth[];
    onClose: () => void;
    onSuccess: () => void;
};

interface IFormValues {
    googleAuthId: string;
    type: GoogleDriveType;
    folderId?: string;
    maxResults?: number;
    fileTypes?: MimeType[];
    modifiedTimeFrom?: string;
    modifiedTimeTo?: string;
}

export const SyncGoogleDrive = ({
    isOpen,
    queryLoading,
    defaultType,
    defaultGoogleAuths,
    defaultFolderOptions,
    onSuccess,
    onClose,
}: SyncGoogleDriveProps) => {
    const { handleMessage } = useMainContext();

    const { options: folderOptionResult, query: queryFolderOptions } = useSelectGoogleFolder({
        enabled: typeof defaultFolderOptions !== 'object',
    });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustomData({
        url: 'google-auth',
        enabled: typeof defaultGoogleAuths !== 'object',
    });

    const { handleCustomMutationData } = useCustomMutationData();

    const [form] = CustomForm.useForm<IFormValues>();

    const [loading, setLoading] = useState(false);
    const [isActiveGoogleAuth, setIsActiveGoogleAuth] = useState(false);
    const [googleAuthId, setGoogleAuthId] = useState<string | undefined>(undefined);
    const [selectedEmail, setSelectedEmail] = useState<string | undefined>(undefined);
    const [googleExpiresAt, setGoogleExpiresAt] = useState<Date | undefined>(undefined);

    const [type, setType] = useState(GoogleDriveType.FILE);
    const [fileTypes, setFileTypes] = useState<MimeType[]>([]);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);
    const [folderId, setFolderId] = useState<string | undefined>(undefined);

    const [pageSize, setPageSize] = useState(50);
    const [hasMore, setHasMore] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [updateAll, setUpdateAll] = useState(false);
    const [previewData, setPreviewData] = useState<IGoogleDrivePreviewItem[]>([]);
    const [selectedRows, setSelectedRows] = useState<IGoogleDrivePreviewItem[]>([]);

    const googleAuths = useMemo(() => {
        if (defaultGoogleAuths?.length) return defaultGoogleAuths;

        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.filter(
            (item: IGoogleAuth) => !isExpiredToken(item.googleExpiresAt),
        );
    }, [googleAuthsResult?.data?.data, defaultGoogleAuths]);

    const folderOptions = useMemo(() => {
        if (defaultFolderOptions?.length) return defaultFolderOptions;

        if (!folderOptionResult?.length) return [];

        return folderOptionResult;
    }, [folderOptionResult, defaultFolderOptions]);

    useEffect(() => {
        if (!googleAuths?.length) {
            setIsActiveGoogleAuth(false);
        } else {
            setIsActiveGoogleAuth(true);
            setGoogleAuthId(googleAuths?.[0]?.id);
            setSelectedEmail(googleAuths?.[0]?.email);
            setGoogleExpiresAt(googleAuths?.[0]?.googleExpiresAt);
        }
    }, [googleAuths]);

    useEffect(() => {
        setSelectedRows([]);
    }, [previewData]);

    const steps: StepsProps['items'] = [
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

    const columns: ColumnType<IGoogleDrivePreviewItem>[] = [
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
            render: (lastModified?: Date) => formatDate(lastModified),
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

    const rowSelection: TableProps<IGoogleDrivePreviewItem>['rowSelection'] = {
        type: 'checkbox',
        onChange: (_: Key[], selectedRows: IGoogleDrivePreviewItem[]) => {
            setSelectedRows([...selectedRows]);
        },
        getCheckboxProps: (record: IGoogleDrivePreviewItem) => ({
            name: record.name,
        }),
    };

    const handleGoogleAuth = async () => {
        setLoading(true);

        try {
            const url = getGoogleAuthUrl();

            if (!url) {
                handleMessage({
                    type: MessageType.ERROR,
                    content: 'Lỗi khi tạo URL kết nối Google',
                });
                return;
            }

            window.location.href = url;
        } catch (e) {
            handleMessage({
                type: MessageType.ERROR,
                content: 'Lỗi khi tạo URL kết nối Google',
            });
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
            handleCustomMutationData({
                values,
                url: 'google-drive/preview-data-sync',
                successNotification: (data) => {
                    setLoading(false);

                    if (!data?.data?.data) {
                        setCurrentStep(StepEnum.Settings);

                        return {
                            type: MessageType.ERROR,
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
                        type: MessageType.ERROR,
                        message: 'Lỗi khi xem trước dữ liệu đồng bộ',
                    };
                },
            });
        } catch (e) {
            handleMessage({
                type: MessageType.ERROR,
                content: 'Lỗi khi xem trước dữ liệu đồng bộ',
            });
        }
    };

    const handleSyncData = async () => {
        if (!selectedRows?.length) {
            handleMessage({
                type: MessageType.ERROR,
                content: 'Không có dữ liệu để đồng bộ',
            });
            return;
        }

        setLoading(true);

        try {
            handleCustomMutationData({
                method: 'put',
                url: 'google-drive/save-data-sync',
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
                            type: MessageType.ERROR,
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
                        type: MessageType.ERROR,
                        message: 'Lỗi khi đồng bộ dữ liệu',
                    };
                },
            });
        } catch (e) {
            handleMessage({
                type: MessageType.ERROR,
                content: 'Lỗi khi đồng bộ dữ liệu',
            });
        }
    };

    const handleChangeStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderSettingStep = () => {
        return (
            <CustomForm
                form={form}
                layout="vertical"
                initialValues={{
                    folderId: '',
                    maxResults: 100,
                    googleAuthId: googleAuths?.[0]?.id,
                    type: defaultType ?? GoogleDriveType.FILE,
                }}
            >
                <CustomRow gutter={[16, 0]}>
                    <CustomCol span={12}>
                        <CustomForm.Item
                            label="Kết nối Google"
                            name={FieldsEnum.GoogleAuthId}
                            rules={[{ required: true, message: 'Vui lòng chọn kết nối Google' }]}
                        >
                            <CustomSelect
                                placeholder="Chọn kết nối Google"
                                options={googleAuths?.map((auth: IGoogleAuth) => ({
                                    value: auth.id,
                                    label: auth.email,
                                }))}
                                onChange={(value) => {
                                    const selectedGoogleAuth = googleAuths?.find(
                                        (auth: IGoogleAuth) => auth.id === value,
                                    );

                                    setGoogleAuthId(value);
                                    setSelectedEmail(selectedGoogleAuth?.email);
                                    setGoogleExpiresAt(selectedGoogleAuth?.googleExpiresAt);
                                }}
                            />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={12}>
                        <CustomForm.Item
                            label="Loại đồng bộ"
                            name={FieldsEnum.Type}
                            rules={[{ required: true, message: 'Vui lòng chọn loại đồng bộ' }]}
                        >
                            <CustomSelect
                                disabled={!!defaultType}
                                placeholder="Loại đồng bộ"
                                defaultValue={defaultType ?? GoogleDriveType.FILE}
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
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={12}>
                        <CustomForm.Item
                            label="Thư mục"
                            name={FieldsEnum.FolderId}
                            rules={[{ required: true, message: 'Vui lòng chọn thư mục' }]}
                        >
                            <CustomSelect
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
                                    String(option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={12}>
                        <CustomForm.Item name={FieldsEnum.MaxResults} label="Số lượng">
                            <CustomInputNumber min={1} placeholder="Số lượng" />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={24}>
                        <CustomForm.Item name={FieldsEnum.FileTypes} label="Loại tệp">
                            <CustomSelect
                                mode="multiple"
                                placeholder="Loại tệp"
                                disabled={type === GoogleDriveType.FOLDER}
                                onChange={(value) => setFileTypes(value as MimeType[])}
                                options={Object.values(MimeType).map((type) => ({
                                    value: type,
                                    label: type?.toUpperCase(),
                                }))}
                            />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={12}>
                        <CustomForm.Item name={FieldsEnum.ModifiedTimeFrom} label="Từ ngày">
                            <CustomPicker placeholder="Chọn ngày bắt đầu" />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={12}>
                        <CustomForm.Item name={FieldsEnum.ModifiedTimeTo} label="Đến ngày">
                            <CustomPicker placeholder="Chọn ngày kết thúc" />
                        </CustomForm.Item>
                    </CustomCol>
                    <CustomCol span={24}>
                        <CustomForm.Item name={FieldsEnum.CustomQuery} label="Tùy chọn tìm kiếm">
                            <CustomInput.TextArea
                                allowClear
                                rows={4}
                                placeholder="Tùy chọn tìm kiếm"
                                onClear={() =>
                                    form.setFieldValue(
                                        FieldsEnum.CustomQuery as keyof IFormValues,
                                        '',
                                    )
                                }
                            />
                        </CustomForm.Item>
                    </CustomCol>
                </CustomRow>
            </CustomForm>
        );
    };

    const renderPreviewStep = () => {
        return (
            <CustomSpace direction="vertical" className="w-full h-full">
                <CustomCard className="shadow-sm" variant="borderless">
                    <div
                        className={`grid gap-6 ${type === GoogleDriveType.FOLDER ? 'grid-cols-3' : 'grid-cols-4'}`}
                    >
                        <CustomCard className="text-center bg-hub-active border-hub-border">
                            <p className="text-sm text-gray-600 font-bold mt-1">Tổng số lượng</p>
                            <div className="text-blue-600 text-2xl font-bold">
                                {totalCount ?? 0}
                            </div>
                        </CustomCard>
                        <CustomCard className="text-center bg-hub-active border-hub-border">
                            <p className="text-sm text-gray-600 font-bold mt-1">Tổng kích thước</p>
                            <div className="text-blue-600 text-2xl font-bold">{totalSize ?? 0}</div>
                        </CustomCard>
                        <CustomCard className="text-center bg-green-50 border-green-200">
                            <p className="text-sm text-gray-600 font-bold mt-1">Có thêm dữ liệu</p>
                            <div className="text-green-600 text-2xl flex items-center justify-center">
                                {hasMore ? <Icon icon="lucide:check" /> : <Icon icon="lucide:x" />}
                            </div>
                        </CustomCard>
                        {type !== GoogleDriveType.FOLDER && (
                            <CustomCard className="text-center bg-purple-50 border-purple-200">
                                <p className="text-sm text-gray-600 font-bold mt-1">Loại file</p>
                                <div className="flex flex-wrap justify-center gap-2 my-2">
                                    {fileTypes?.map((mime) => (
                                        <CustomTag color="blue" key={mime}>
                                            {mime?.toUpperCase()}
                                        </CustomTag>
                                    ))}
                                </div>
                            </CustomCard>
                        )}
                    </div>
                </CustomCard>
                <div className="flex items-center mb-2">
                    <CustomCheckbox
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
                    </CustomCheckbox>
                </div>
                <CustomDataTable
                    bordered
                    size="small"
                    rowKey="googleDriveId"
                    rowSelection={rowSelection}
                    dataSource={previewData || []}
                    columns={columns as ColumnType<IGoogleDrivePreviewItem>[]}
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

    const renderFooter = () => {
        if (!isActiveGoogleAuth) {
            return (
                <CustomFlex justify="space-between" align="center" gap={16}>
                    <CustomButton
                        onClick={onClose}
                        className="w-full"
                        icon={<Icon icon="lucide:x" />}
                    >
                        <span>Đóng</span>
                    </CustomButton>
                    <CustomButton
                        type="primary"
                        className="w-full"
                        onClick={handleGoogleAuth}
                        icon={<Icon icon="lucide:google" />}
                    >
                        Kết nối Google
                    </CustomButton>
                </CustomFlex>
            );
        }

        return (
            <CustomFlex justify="space-between" align="center" gap={16}>
                <CustomButton
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
                </CustomButton>

                {currentStep === StepEnum.Preview && (
                    <>
                        <CustomButton
                            type="primary"
                            className="w-full"
                            onClick={handleSyncData}
                            icon={<Icon icon="lucide:sync" />}
                        >
                            <span>Đồng bộ</span>
                        </CustomButton>
                        <CustomButton
                            type="primary"
                            className="w-full"
                            icon={<Icon icon="lucide:arrow-left" />}
                            onClick={() => handleChangeStep(currentStep - 1)}
                        >
                            <span>Quay lại</span>
                        </CustomButton>
                    </>
                )}

                {currentStep === StepEnum.Settings && (
                    <CustomButton
                        type="primary"
                        className="w-full"
                        icon={<Icon icon="lucide:arrow-right" />}
                        onClick={() => {
                            setCurrentStep(StepEnum.Preview);
                            handlePreviewData();
                        }}
                    >
                        <span>Tiếp theo</span>
                    </CustomButton>
                )}
            </CustomFlex>
        );
    };

    const renderDoneStep = () => {
        return <CustomResult status="success" title="Đồng bộ dữ liệu thành công" />;
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
                footer: renderFooter(),
                title: 'Đồng bộ Google Drive',
                loading:
                    queryLoading || queryFolderOptions?.isLoading || queryGoogleAuths?.isLoading,
            }}
        >
            <CustomSpin spinning={loading}>
                {isActiveGoogleAuth && (
                    <CustomSpace
                        direction="vertical"
                        className="w-full h-full px-3 overflow-x-hidden"
                    >
                        {Boolean(googleExpiresAt && selectedEmail) && (
                            <CustomCard
                                size="small"
                                className="mb-4 bg-amber-50 border-amber-200 text-md font-bold"
                            >
                                <CustomFlex justify="space-between" align="center">
                                    <CustomSpace size="small">
                                        <Icon icon="lucide:mail" />
                                        <span>Email được chọn:</span>
                                    </CustomSpace>
                                    <span className="text-blue-600">{selectedEmail}</span>
                                </CustomFlex>
                                <CustomFlex justify="space-between" align="center">
                                    <CustomSpace size="small">
                                        <Icon icon="lucide:timer" />
                                        <span>Token hết hạn sau</span>
                                    </CustomSpace>
                                    <CustomStatistic.Countdown
                                        format="HH:mm:ss"
                                        value={new Date(googleExpiresAt as Date).getTime()}
                                        onFinish={() => {
                                            setGoogleAuthId(undefined);
                                            setSelectedEmail(undefined);
                                            setIsActiveGoogleAuth(false);
                                            setGoogleExpiresAt(undefined);

                                            handleMessage({
                                                type: MessageType.INFO,
                                                content: 'Token đã hết hạn. Vui lòng kết nối lại.',
                                            });
                                        }}
                                    />
                                </CustomFlex>
                            </CustomCard>
                        )}

                        <CustomCard className="mb-4 bg-green-50 border-green-200" size="small">
                            <CustomSteps
                                items={steps}
                                size="default"
                                current={currentStep}
                                onChange={handleChangeStep}
                            />
                        </CustomCard>

                        <CustomSpace size="middle" direction="vertical" className="w-full h-full">
                            {renderContent()}
                        </CustomSpace>
                    </CustomSpace>
                )}
            </CustomSpin>
        </CustomModal>
    );
};
