'use client';

import {
    ColumnsType,
    CustomButton,
    CustomElement,
    CustomSpace,
    TableContainer,
} from '@/components/custom';
import { FolderModal } from '@/components/module/folders';
import { SyncGoogleDrive } from '@/components/module/sync-google-drive';
import { ElementType, GoogleDriveType } from '@/enums';
import { useCustomModal, useSelectGoogleFolder, useTableContainer } from '@/hooks';
import { NGoogle } from '@/interfaces';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

const FolderPage = () => {
    const [isOpenSyncFile, setIsOpenSyncFile] = useState(false);

    const tableContainerData = useTableContainer({
        resource: 'google-folder',
    });

    const modalPropsData = useCustomModal({
        action: 'edit',
        resource: 'google-folder',
    });

    const { options: folderOptions, query: queryFolderOptions } = useSelectGoogleFolder({
        enabled: false,
    });

    useEffect(() => {
        queryFolderOptions?.refetch();
    }, []);

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
            render: (createdAt: Date) => formatDate(createdAt),
        },
        {
            key: 'lastModified',
            title: 'Ngày chỉnh sửa',
            dataIndex: 'lastModified',
            sorter: true,
            render: (lastModified: Date) => formatDate(lastModified),
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

    return (
        <CustomSpace size="middle" direction="vertical" className="w-full h-full">
            <CustomElement
                elementType={ElementType.TITLE}
                actions={[
                    <CustomButton
                        type="primary"
                        key="sync google drive"
                        title="Đồng bộ từ Google Drive"
                        icon={<Icon icon="ic:baseline-sync" />}
                        onClick={() => setIsOpenSyncFile(true)}
                    />,
                ]}
            />

            <TableContainer
                columns={columns}
                resource="google-folder"
                tableContainerData={tableContainerData}
                actionItems={[
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <Icon icon="lucide:edit" />,
                        onClick: (record) => modalPropsData?.show?.(record?.id),
                    },
                ]}
                filterSearch={{
                    placeholder: 'Tìm kiếm thư mục',
                }}
            />

            <FolderModal
                modalPropsData={modalPropsData}
                folderOptions={folderOptions ?? []}
                onSubmit={() => {}}
            />

            <SyncGoogleDrive
                isOpen={isOpenSyncFile}
                defaultType={GoogleDriveType.FOLDER}
                onClose={() => setIsOpenSyncFile(false)}
                defaultFolderOptions={folderOptions || []}
                queryLoading={queryFolderOptions?.isLoading}
                onSuccess={() => tableContainerData?.tableQuery?.refetch()}
            />
        </CustomSpace>
    );
};

export default FolderPage;
