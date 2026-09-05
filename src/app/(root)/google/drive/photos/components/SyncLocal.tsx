'use client';

import {
    CheckboxChangeEvent,
    ColumnType,
    CustomButton,
    CustomCard,
    CustomCheckbox,
    CustomCol,
    CustomDataTable,
    CustomFlex,
    CustomForm,
    CustomInputNumber,
    CustomModal,
    CustomPicker,
    CustomResult,
    CustomRow,
    CustomSelect,
    CustomSpace,
    CustomSpin,
    CustomSteps,
    StepsProps,
    TableProps,
} from '@/components/custom-antd';
import { MessageType, MimeType } from '@/enums';
import { useMainContext } from '@/contexts/MainContext';
import { GoogleDriveType } from '../../enums';
import { useCustomMutationData, useSelectGoogleFolder } from '@/hooks';
import type { IDataOption, Option } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useEffect, useState, type Key } from 'react';
import type { ILocalFilePreviewItem } from '../types';

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
    fileTypes?: MimeType[];
    modifiedTimeTo?: string;
    modifiedTimeFrom?: string;
}

export const SyncLocal = ({
    isOpen,
    queryLoading,
    folderOptions,
    onSuccess,
    onClose,
}: SyncLocalProps) => {
    const { handleMessage } = useMainContext();

    const { apiUrl } = useCustomMutationData();

    const [form] = CustomForm.useForm<IFormValues>();

    const [loading, setLoading] = useState(false);
    const [directoryHandle, setDirectoryHandle] = useState<any>(null);
    const [isPermissionsGranted, setIsPermissionsGranted] = useState(false);

    const [type, setType] = useState(GoogleDriveType.FILE);
    const [fileTypes, setFileTypes] = useState<MimeType[]>([]);
    const [currentStep, setCurrentStep] = useState(StepEnum.Settings);
    const [folderId, setFolderId] = useState<string | undefined>(undefined);

    const [pageSize, setPageSize] = useState(50);
    const [hasMore, setHasMore] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [updateAll, setUpdateAll] = useState(false);
    const [previewData, setPreviewData] = useState<ILocalFilePreviewItem[]>([]);
    const [selectedRows, setSelectedRows] = useState<ILocalFilePreviewItem[]>([]);

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

    const columns: ColumnType<ILocalFilePreviewItem>[] = [
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
            dataIndex: 'name',
            key: 'path',
            ellipsis: true,
            width: '20%',
            render: (name: string) => name,
        },
    ];

    const rowSelection: TableProps<ILocalFilePreviewItem>['rowSelection'] = {
        type: 'checkbox',
        onChange: (_: Key[], selectedRows: ILocalFilePreviewItem[]) => {
            setSelectedRows([...selectedRows]);
        },
        getCheckboxProps: (record: ILocalFilePreviewItem) => ({
            name: record.name,
        }),
    };

    const handleRequestFileAccess = async () => {
        setLoading(true);

        try {
            if (!('showOpenFilePicker' in window)) {
                handleMessage({
                    type: MessageType.ERROR,
                    content: 'Trình duyệt không hỗ trợ File System Access API',
                });
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
                handleMessage({
                    type: MessageType.SUCCESS,
                    content: 'Đã cấp quyền truy cập thư mục thành công',
                });
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                handleMessage({
                    type: MessageType.INFO,
                    content: 'Người dùng đã hủy việc chọn thư mục',
                });
            } else {
                handleMessage({
                    type: MessageType.ERROR,
                    content: 'Lỗi khi yêu cầu quyền truy cập thư mục: ' + error.message,
                });
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
                handleMessage({
                    type: MessageType.ERROR,
                    content: 'Chưa chọn thư mục',
                });
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
                handleMessage({
                    content: 'Đồng bộ dữ liệu thành công',
                });
            } else {
                setCurrentStep(StepEnum.Preview);
                handleMessage({
                    type: MessageType.ERROR,
                    content: 'Lỗi khi đồng bộ dữ liệu',
                });
            }
        } catch (e) {
            setCurrentStep(StepEnum.Preview);
            handleMessage({
                type: MessageType.ERROR,
                content: 'Lỗi khi đồng bộ dữ liệu',
            });
        } finally {
            setLoading(false);
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
                    type: GoogleDriveType.FILE,
                }}
            >
                <CustomRow gutter={[16, 0]}>
                    <CustomCol span={12}>
                        <CustomForm.Item
                            label="Loại đồng bộ"
                            name={FieldsEnum.Type}
                            rules={[{ required: true, message: 'Vui lòng chọn loại đồng bộ' }]}
                        >
                            <CustomSelect
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
                </CustomRow>
            </CustomForm>
        );
    };

    const renderPreviewStep = () => {
        return (
            <CustomSpace direction="vertical" className="w-full h-full">
                <CustomCard className="shadow-sm" variant="borderless">
                    <div className="grid gap-6 grid-cols-3">
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
                            <p className="text-sm text-gray-600 font-bold mt-1">Thư mục đã chọn</p>
                            <div className="text-green-600 text-2xl flex items-center justify-center">
                                {directoryHandle ? (
                                    <Icon icon="lucide:check" />
                                ) : (
                                    <Icon icon="lucide:x" />
                                )}
                            </div>
                        </CustomCard>
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
            </CustomSpace>
        );
    };

    const renderFooter = () => {
        if (!isPermissionsGranted) {
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
                        onClick={handleRequestFileAccess}
                        icon={<Icon icon="lucide:folder-open" />}
                    >
                        Chọn thư mục
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
                loading: queryLoading,
                footer: renderFooter(),
                title: 'Đồng bộ từ thư mục máy tính',
            }}
        >
            <CustomSpin spinning={loading}>
                {isPermissionsGranted && (
                    <CustomSpace
                        direction="vertical"
                        className="w-full h-full px-3 overflow-x-hidden"
                    >
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
