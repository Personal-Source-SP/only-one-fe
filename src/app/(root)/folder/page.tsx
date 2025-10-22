'use client';

import { CustomElement, CustomTableContainer } from '@/components/common';
import FolderModal from '@/components/module/folders/FolderModal';
import SyncGoogleDrive from '@/components/module/sync-google-drive';
import { ElementType, GoogleDriveType } from '@/enums';
import { ActionTableItem, NBaseApi, NGoogle } from '@/interfaces';
import { isExpiredToken } from '@/libs';
import { Icon } from '@iconify/react';
import { useModalForm } from '@refinedev/antd';
import { HttpError, useApiUrl, useCustom, useSelect } from '@refinedev/core';
import { Button, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FC, useEffect, useMemo, useState } from 'react';

const FolderPage: FC = () => {
    const apiUrl = useApiUrl();

    const [quantityRefetch, setQuantityRefetch] = useState(0);
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const {
        open: openFolderModal,
        show: showFolderModal,
        close: closeFolderModal,
        formProps: folderModalFormProps,
        modalProps: folderModalModalProps,
        formLoading: folderModalFormLoading,
    } = useModalForm<NGoogle.IGoogleDriveFolder, HttpError, Partial<NGoogle.IGoogleDriveFolder>>({
        action: 'edit',
        resource: 'google-folder',
        autoResetForm: true,
        warnWhenUnsavedChanges: false,
    });

    const { options: folderOptions, query: queryFolderOptions } =
        useSelect<NGoogle.IGoogleDriveFolder>({
            resource: 'google-folder/all',
            optionValue: (item: NGoogle.IGoogleDriveFolder) => item.id,
            optionLabel: (item: NGoogle.IGoogleDriveFolder) => item.name,
            pagination: {
                mode: 'off',
            },
            queryOptions: {
                enabled: false,
            },
        });

    const { result: googleAuthsResult, query: queryGoogleAuths } = useCustom<
        NBaseApi.IResponse<NGoogle.IGoogleAuth[]>
    >({
        url: `${apiUrl}/google-auth`,
        method: 'get',
        queryOptions: {
            enabled: false,
        },
    });

    useEffect(() => {
        queryFolderOptions?.refetch();
    }, []);

    const googleAuthNotExpired = useMemo(() => {
        if (!googleAuthsResult?.data?.data?.length) return [];

        return googleAuthsResult?.data?.data?.filter(
            (item) => !isExpiredToken(item.googleExpiresAt),
        );
    }, [googleAuthsResult?.data?.data]);

    const columns: ColumnsType<NGoogle.IGoogleDriveFolder> = [
        {
            title: 'Tên thư mục',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            sorter: true,
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
            key: 'lastModified',
            title: 'Ngày chỉnh sửa',
            dataIndex: 'lastModified',
            sorter: true,
            render: (lastModified: Date) =>
                lastModified ? dayjs(lastModified).format('DD/MM/YYYY HH:mm:ss') : '---',
        },
        {
            key: 'isTrashed',
            title: 'Đã xóa',
            align: 'center',
            dataIndex: 'isTrashed',
            render: (isTrashed: boolean) =>
                isTrashed ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
        {
            key: 'isStarred',
            title: 'Gắn sao',
            align: 'center',
            dataIndex: 'isStarred',
            render: (isStarred: boolean) =>
                isStarred ? (
                    <Icon icon="lucide:check" className="w-full" />
                ) : (
                    <Icon icon="lucide:x" className="w-full" />
                ),
        },
    ];

    const actionItems: ActionTableItem[] = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record) => showFolderModal(record?.id),
        },
    ];

    return (
        <Space size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                title="Danh sách thư mục"
                elementType={ElementType.TITLE}
                actions={[
                    <Button
                        type="primary"
                        key="sync google drive"
                        icon={<Icon icon="ic:baseline-sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    >
                        Đồng bộ từ Google Drive
                    </Button>,
                ]}
            />

            <CustomTableContainer
                columns={columns}
                resource="google-folder"
                actionItems={actionItems}
                quantityRefetch={quantityRefetch}
                filterSearch={{
                    placeholder: 'Tìm kiếm thư mục',
                }}
            />

            <FolderModal
                open={openFolderModal}
                onClose={closeFolderModal}
                formProps={folderModalFormProps}
                isLoading={folderModalFormLoading}
                modalProps={folderModalModalProps}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            />

            <SyncGoogleDrive
                isOpen={isOpenSyncFile}
                defaultType={GoogleDriveType.FOLDER}
                onClose={() => setIsOpenSyncFile(false)}
                defaultFolderOptions={folderOptions || []}
                defaultGoogleAuths={googleAuthNotExpired ?? []}
                onSuccess={() => setQuantityRefetch(quantityRefetch + 1)}
                queryLoading={queryGoogleAuths?.isLoading || queryFolderOptions?.isLoading}
            />
        </Space>
    );
};

export default FolderPage;
