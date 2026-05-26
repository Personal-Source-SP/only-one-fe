'use client';

import {
    CustomButton,
    CustomFlex,
    CustomForm,
    CustomInput,
    CustomModal,
    CustomSpace,
    CustomSpin,
    CustomTypography,
} from '@/components/custom';
import { useMainContext } from '@/contexts/MainContext';
import { NotificationType } from '@/enums';
import { NBaseApi, NDataProvider } from '@/interfaces';
import {
    buildLocalFolderRegistrationRequest,
    buildLocalFolderSuccessResponse,
    resolveLocalFolderRecordState,
} from '@/libs';
import { Icon } from '@iconify/react';
import { useApiUrl } from '@refinedev/core';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

type LocalDirectoryHandle = {
    name: string;
};

type LocalDirectorySelection = {
    source: 'manual' | 'picker';
};

type LocalFolderFormValues = {
    itemUrl: string;
    itemCode: string;
    itemName: string;
    folderName: string;
    folderPath?: string;
};

type LocalFolderPickerOptions = {
    mode?: 'read' | 'readwrite';
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
};

type DirectoryPickerWindow = Window & {
    showDirectoryPicker?: (options?: LocalFolderPickerOptions) => Promise<LocalDirectoryHandle>;
};

type LocalFolderModalProps = {
    open: boolean;
    items: NDataProvider.IItem[];
    queryLoading: boolean;
    dataProvider: NDataProvider.IDataProvider;
    providerItems: NDataProvider.IDataProviderItem[];

    onClose: () => void;
    onSuccess: (response: NDataProvider.RegisterLocalFolderResponse) => void;
};

export const LocalFolderModal = ({
    open,
    items,
    queryLoading,
    onClose,
    onSuccess,
    dataProvider,
    providerItems,
}: LocalFolderModalProps) => {
    const apiUrl = useApiUrl();

    const { data: session } = useSession();
    const { handleNotification } = useMainContext();

    const [form] = CustomForm.useForm<LocalFolderFormValues>();
    const selectedFolderName = CustomForm.useWatch('folderName', form);
    const selectedFolderPath = CustomForm.useWatch('folderPath', form);

    const [loading, setLoading] = useState(false);
    const [isDirectoryPickerSupported, setIsDirectoryPickerSupported] = useState(false);
    const [directorySelection, setDirectorySelection] = useState<LocalDirectorySelection>();

    useEffect(() => {
        const pickerWindow = window as DirectoryPickerWindow;
        const nextDirectoryPickerSupported = !!pickerWindow.showDirectoryPicker;

        setIsDirectoryPickerSupported(nextDirectoryPickerSupported);

        if (!nextDirectoryPickerSupported) {
            setDirectorySelection({ source: 'manual' });
        }
    }, []);

    useEffect(() => {
        if (!selectedFolderName?.trim()) {
            form.setFieldsValue({
                itemCode: '',
                itemName: '',
                itemUrl: '',
            });

            return;
        }

        const request = buildLocalFolderRegistrationRequest({
            dataProvider,
            folderName: selectedFolderName,
            folderPath: selectedFolderPath,
        });

        form.setFieldsValue({
            itemUrl: request.itemUrl,
            itemCode: request.itemCode,
            itemName: request.itemName,
        });
    }, [dataProvider, form, selectedFolderName, selectedFolderPath]);

    const applyFolderSelection = (folderName: string) => {
        setDirectorySelection({ source: 'picker' });
        form.setFieldsValue({
            folderName,
            folderPath: undefined,
        });
    };

    const handleReset = () => {
        setDirectorySelection(isDirectoryPickerSupported ? undefined : { source: 'manual' });
        form.resetFields();
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const createResource = async <TRequest, TResponse>(
        resource: string,
        values: TRequest,
    ): Promise<TResponse> => {
        const accessToken = session?.user?.accessToken;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${apiUrl}/${resource}`, {
            body: JSON.stringify(values),
            method: 'POST',
            headers,
        });

        const responseData = (await response.json()) as NBaseApi.IResponse<TResponse>;

        if (!response.ok || !responseData.data) {
            throw new Error(responseData.errorMessage ?? 'Không thể xử lý yêu cầu');
        }

        return responseData.data;
    };

    const handlePickFolder = async () => {
        const pickerWindow = window as DirectoryPickerWindow;

        if (!pickerWindow.showDirectoryPicker) {
            setDirectorySelection({ source: 'manual' });
            handleNotification({
                type: NotificationType.INFO,
                message: 'Browser hiện tại không hỗ trợ chọn thư mục trực tiếp',
                description:
                    'Hãy nhập tên thư mục và đường dẫn thư mục để tiếp tục tạo item từ metadata.',
            });

            return;
        }

        try {
            const nextDirectoryHandle = await pickerWindow.showDirectoryPicker({
                mode: 'read',
                startIn: 'documents',
            });

            applyFolderSelection(nextDirectoryHandle.name);
        } catch (error) {
            const errorName = error instanceof Error ? error.name : '';
            if (errorName === 'AbortError') return;

            handleNotification({
                type: NotificationType.ERROR,
                message: 'Không thể chọn thư mục',
                description: error instanceof Error ? error.message : 'Không thể chọn thư mục',
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const values = await form.validateFields();
            const request = buildLocalFolderRegistrationRequest({
                dataProvider,
                folderName: values.folderName,
                folderPath: values.folderPath,
            });
            const { existingItem, existingProviderItem } = resolveLocalFolderRecordState({
                items,
                request,
                providerItems,
            });

            if (existingProviderItem?.id) {
                handleNotification({
                    type: NotificationType.ERROR,
                    message: 'Thư mục đã được cấu hình',
                    description: 'Nhà cung cấp này đã có liên kết với thư mục đã chọn',
                });

                return;
            }

            let itemId = existingItem?.id;
            let createdItem = false;

            if (!itemId) {
                const createdItemRecord = await createResource<
                    NDataProvider.CreateLocalFolderItemRequest,
                    NDataProvider.IItem
                >('items', {
                    code: request.itemCode,
                    name: request.itemName,
                });

                itemId = createdItemRecord.id;
                createdItem = true;
            }

            const createdProviderItem = await createResource<
                NDataProvider.CreateLocalFolderProviderItemRequest,
                NDataProvider.IDataProviderItem
            >('data-provider-items', {
                itemId,
                itemUrl: request.itemUrl,
                dataProviderId: request.dataProviderId,
            });

            const response = buildLocalFolderSuccessResponse({
                itemId,
                request,
                createdItem,
                dataProviderItemId: createdProviderItem.id,
            });

            handleNotification({
                message: 'Thêm thư mục thành công',
                description: createdItem
                    ? 'Đã tạo mới đối tượng và liên kết nhà cung cấp'
                    : 'Đã tái sử dụng đối tượng hiện có và tạo liên kết nhà cung cấp',
            });

            onSuccess(response);
            handleClose();
        } catch (error) {
            handleNotification({
                type: NotificationType.ERROR,
                message: 'Thêm thư mục thất bại',
                description: error instanceof Error ? error.message : 'Thêm thư mục thất bại',
            });
        } finally {
            setLoading(false);
        }
    };

    const renderFooter = () => {
        return (
            <CustomFlex justify="end" align="center" gap={12}>
                <CustomButton onClick={handleClose}>Hủy</CustomButton>
                {isDirectoryPickerSupported && (
                    <CustomButton
                        type="default"
                        icon={<Icon icon="lucide:folder-open" />}
                        onClick={handlePickFolder}
                    >
                        Chọn thư mục nguồn
                    </CustomButton>
                )}
                <CustomButton
                    type="primary"
                    disabled={!selectedFolderName?.trim() || queryLoading}
                    icon={<Icon icon="lucide:plus" />}
                    onClick={handleSubmit}
                >
                    Thêm item
                </CustomButton>
            </CustomFlex>
        );
    };

    return (
        <CustomModal
            modalProps={{
                open,
                width: 720,
                centered: true,
                footer: renderFooter(),
                title: 'Chọn thư mục để thêm item',
                onCancel: handleClose,
            }}
        >
            <CustomSpin spinning={loading || queryLoading}>
                <CustomSpace direction="vertical" className="w-full">
                    <CustomTypography.Text type="secondary">
                        Đăng ký metadata thư mục để tạo hoặc tái sử dụng `item`, sau đó liên kết nó
                        với `data-provider` hiện tại.
                    </CustomTypography.Text>

                    <CustomTypography.Text type="secondary">
                        Luồng này không upload, preview, hoặc sync các file bên trong thư mục.
                    </CustomTypography.Text>

                    {!isDirectoryPickerSupported && (
                        <CustomTypography.Text type="secondary">
                            Browser hiện tại không hỗ trợ chọn thư mục trực tiếp. Hãy nhập tên thư
                            mục và đường dẫn thư mục theo metadata bạn muốn dùng để tạo item.
                        </CustomTypography.Text>
                    )}

                    {directorySelection?.source === 'picker' && (
                        <CustomTypography.Text type="secondary">
                            Browser đã cung cấp tên thư mục. Nếu cần định danh chính xác hơn, bạn có
                            thể nhập thêm đường dẫn thư mục trước khi submit.
                        </CustomTypography.Text>
                    )}

                    <CustomForm form={form} layout="vertical" className="[&_.ant-form-item]:!mb-2">
                        <CustomForm.Item
                            label="Tên thư mục"
                            name="folderName"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên thư mục',
                                },
                            ]}
                        >
                            <CustomInput
                                placeholder={
                                    isDirectoryPickerSupported
                                        ? 'Chọn thư mục hoặc nhập tên thư mục'
                                        : 'Nhập tên thư mục'
                                }
                                suffix={
                                    selectedFolderName?.trim() ? (
                                        <Icon icon="lucide:check" className="text-green-500" />
                                    ) : undefined
                                }
                            />
                        </CustomForm.Item>

                        <CustomForm.Item
                            label="Đường dẫn thư mục"
                            name="folderPath"
                            rules={[
                                {
                                    required: !isDirectoryPickerSupported,
                                    message: 'Vui lòng nhập đường dẫn thư mục',
                                },
                            ]}
                        >
                            <CustomInput placeholder="Nhập hoặc xác nhận đường dẫn thư mục" />
                        </CustomForm.Item>

                        <CustomForm.Item label="Tên đối tượng" name="itemName">
                            <CustomInput
                                readOnly
                                placeholder="Tên item sẽ được tạo hoặc tái sử dụng tự động"
                            />
                        </CustomForm.Item>

                        <CustomForm.Item label="Mã đối tượng" name="itemCode">
                            <CustomInput
                                readOnly
                                placeholder="Mã item sẽ được tạo hoặc tái sử dụng tự động"
                            />
                        </CustomForm.Item>

                        <CustomForm.Item label="URL đối tượng" name="itemUrl">
                            <CustomInput
                                readOnly
                                placeholder="URL đối tượng sẽ được dẫn xuất tự động"
                            />
                        </CustomForm.Item>
                    </CustomForm>
                </CustomSpace>
            </CustomSpin>
        </CustomModal>
    );
};
