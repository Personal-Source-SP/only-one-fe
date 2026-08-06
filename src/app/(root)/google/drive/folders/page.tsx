'use client';

import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { DataTableContainer } from '@/components/common';
import { CustomButton } from '@/components/custom';
import { GoogleDriveType } from '@/enums';
import { NGoogle } from '@/interfaces';

import { columns, filterSearch } from './constants';
import { useGoogleFolderPage } from './hooks';
import { FolderModal, SyncGoogleDrive } from './components';

const FolderPage = () => {
    const {
        isOpenSyncFile,
        setIsOpenSyncFile,
        tableContainerData,
        modalPropsData,
        folderOptions,
        queryFolderOptions,
    } = useGoogleFolderPage();

    const actionItems = [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <Icon icon="lucide:edit" />,
            onClick: (record: NGoogle.IGoogleDriveFolder) => modalPropsData?.show?.(record?.id),
        },
    ];

    const actionButtons: ReactNode[] = [
        <CustomButton
            type="primary"
            key="sync-google-drive"
            title="Đồng bộ từ Google Drive"
            icon={<Icon icon="ic:baseline-sync" />}
            onClick={() => setIsOpenSyncFile(true)}
        >
            Đồng bộ
        </CustomButton>,
    ];

    return (
        <>
            <DataTableContainer
                columns={columns}
                resource="google-folder"
                title="Danh sách thư mục"
                description="Quản lý các thư mục trong Google Drive"
                actionButtons={actionButtons}
                actionItems={actionItems}
                tableContainerData={tableContainerData}
                filterSearch={filterSearch}
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
        </>
    );
};

export default FolderPage;
