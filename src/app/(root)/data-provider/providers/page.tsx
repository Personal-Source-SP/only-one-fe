'use client';

import { CustomElement, CustomTableContainer } from '@/components/common';
import { DataProviderStatus, ElementType } from '@/enums';
import { NDataProvider } from '@/interfaces';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError } from '@refinedev/core';
import { Button, Space, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useCallback, useState } from 'react';

const DataProviderPage: FC = () => {
    const [quantityRefetch, setQuantityRefetch] = useState(0);

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<NDataProvider.IDataProvider, HttpError, Partial<NDataProvider.IDataProvider>>({
        action: 'edit',
        resource: 'data-providers',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const displayStatus = useCallback((status: DataProviderStatus) => {
        if (!status) return '---';

        let color: string, text: string;

        switch (status) {
            case DataProviderStatus.READY:
                color = 'success';
                text = 'Ready';
                break;
            case DataProviderStatus.TESTING:
                color = 'processing';
                text = 'Testing';
                break;
            case DataProviderStatus.UNCONFIGURED:
                color = 'default';
                text = 'Unconfigured';
                break;
            case DataProviderStatus.ERROR:
                color = 'error';
                text = 'Error';
                break;
            default:
                color = 'default';
                text = status;
        }

        return (
            <Tag color={color} className="text-sm font-medium">
                {text}
            </Tag>
        );
    }, []);

    const columns: ColumnsType<NDataProvider.IDataProvider> = [
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'Mã nhà cung cấp',
            dataIndex: 'identifier',
            key: 'identifier',
            ellipsis: true,
            sorter: true,
        },
        {
            title: 'URL cơ sở',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
            ellipsis: true,
            sorter: true,
        },
        {
            key: 'status',
            title: 'Trạng thái',
            dataIndex: 'status',
            sorter: true,
            render: (status: DataProviderStatus) => displayStatus(status),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: true,
            render: (createdAt: Date) =>
                createdAt ? dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'targetConfig',
            title: 'Cấu hình dữ liệu',
            align: 'center',
            dataIndex: 'targetConfig',
            render: (targetConfig: NDataProvider.ITargetConfig) =>
                targetConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
        {
            key: 'searchConfig',
            title: 'Cấu hình tìm kiếm',
            align: 'center',
            dataIndex: 'searchConfig',
            render: (searchConfig: NDataProvider.ISearchConfig) =>
                searchConfig ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách nhà cung cấp"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="add-data-provider"
                        icon={<Icon icon="lucide:plus" />}
                        // onClick={() => setIsOpenSyncFile(true)}
                    >
                        Thêm nhà cung cấp
                    </Button>,
                ]}
            />

            <CustomTableContainer
                columns={columns}
                resource="data-providers"
                quantityRefetch={quantityRefetch}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => showFolderModal(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm nhà cung cấp',
                }}
            />

            {/* <FolderModal
                open={openFolderModal}
                onClose={closeFolderModal}
                formProps={folderModalFormProps}
                isLoading={folderModalFormLoading}
                modalProps={folderModalModalProps}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            /> */}
        </Space>
    );
};

export default DataProviderPage;
